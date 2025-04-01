import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Eye, Search, Calendar, Check, X, Wrench, Tag, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface SessionSummary {
  id: string;
  created_at: string;
  summary_text: string;
  achieved_goals: string[];
  future_goals: string[];
  progress_rating: number;
  next_session_focus: string;
  additional_notes?: string;
  tools_used?: string[];
  audio_url?: string;
  player_id: string;
  session: {
    id: string;
    session_date: string;
    player: {
      id: string;
      full_name: string;
    } | null;
  };
}

interface Tool {
  id: string;
  name: string;
  description: string;
}

const AllMeetingSummaries = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<SessionSummary[]>([]);
  const [players, setPlayers] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>(searchParams.get('playerId') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const isMobile = useIsMobile();

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_tools')
        .select('*');
      
      if (error) {
        console.error('Error fetching tools:', error);
        return;
      }

      const toolsRecord: Record<string, Tool> = {};
      data?.forEach((tool: Tool) => {
        toolsRecord[tool.id] = tool;
      });
      
      setTools(toolsRecord);
    } catch (error) {
      console.error('Error fetching tools:', error);
    }
  };

  const fetchSummaries = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('יש להתחבר למערכת');
        navigate('/auth');
        return;
      }

      const query = supabase
        .from('session_summaries')
        .select(`
          *,
          session:sessions (
            id,
            session_date,
            player:players (
              id,
              full_name
            )
          )
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching summaries:', error);
        toast.error('שגיאה בטעינת סיכומי המפגשים');
        return;
      }
      
      const uniqueSessions = new Map<string, SessionSummary>();
      data?.forEach((summary: SessionSummary) => {
        if (summary.session && summary.session.id) {
          uniqueSessions.set(summary.session.id, summary);
        }
      });
      
      const uniqueData = Array.from(uniqueSessions.values());
      setSummaries(uniqueData);
      
      applyFilters(uniqueData);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('שגיאה בטעינת סיכומי המפגשים');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data: SessionSummary[] = summaries) => {
    let filtered = [...data];
    
    if (selectedPlayer !== 'all') {
      filtered = filtered.filter(summary => 
        summary.player_id === selectedPlayer || 
        summary.session?.player?.id === selectedPlayer
      );
    }
    
    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(summary => 
        (summary.session?.player?.full_name?.toLowerCase().includes(lowerSearchQuery)) ||
        summary.summary_text.toLowerCase().includes(lowerSearchQuery)
      );
    }
    
    setFilteredSummaries(filtered);
  };

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('players')
        .select('id, full_name')
        .eq('coach_id', user.id);

      if (error) {
        console.error('Error fetching players:', error);
        toast.error('שגיאה בטעינת רשימת השחקנים');
        return;
      }
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('שגיאה בטעינת רשימת השחקנים');
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchTools();
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, []);

  useEffect(() => {
    applyFilters();
    
    if (selectedPlayer !== 'all') {
      setSearchParams({ playerId: selectedPlayer });
    } else {
      setSearchParams({});
    }
  }, [selectedPlayer, searchQuery]);

  const handlePlayerChange = (value: string) => {
    setSelectedPlayer(value);
  };

  const renderSummaryDetails = (summary: SessionSummary) => {
    return (
      <ScrollArea className="h-[calc(100vh-200px)] px-4">
        <div className="space-y-6 text-right">
          {summary.tools_used && summary.tools_used.length > 0 && (
            <div className="mb-2 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3 text-[#8B5CF6] flex items-center">
                <Tag className="ml-2 h-5 w-5" />
                הכלים המנטליים שנבחרו למפגש
              </h3>
              <div className="flex flex-wrap gap-2 bg-purple-50 p-4 rounded-lg border border-purple-100">
                {summary.tools_used.map((toolId, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="py-1.5 px-3 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200"
                  >
                    {tools[toolId]?.name || 'כלי לא זמין'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#6E59A5]">סיכום המפגש</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{summary.summary_text}</p>
            
            {summary.audio_url && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2 text-[#6E59A5]">
                  <Volume2 className="h-4 w-4" />
                  <h4 className="text-sm font-semibold">הקלטת סיכום</h4>
                </div>
                <audio 
                  controls 
                  src={summary.audio_url} 
                  className="w-full rounded-md mt-1"
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#7E69AB]">מטרות שהושגו</h3>
            <div className="space-y-2">
              {summary.achieved_goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#9b87f5]">מטרות להמשך</h3>
            <div className="space-y-2">
              {summary.future_goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold mb-2 text-[#D6BCFA]">פוקוס למפגש הבא</h3>
            <p className="text-gray-700">{summary.next_session_focus}</p>
          </div>

          {summary.additional_notes && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-[#8B5CF6]">הערות נוספות</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{summary.additional_notes}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="hover:bg-white/20 transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
              חזרה לדשבורד
            </Button>
            <h1 className="text-2xl font-bold text-[#6E59A5]">סיכומי מפגשים</h1>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="חיפוש לפי תוכן..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[200px] text-right pl-10 bg-white/90 border-gray-200 focus:border-[#6E59A5]"
              />
            </div>
            <Select
              value={selectedPlayer}
              onValueChange={handlePlayerChange}
            >
              <SelectTrigger className="w-full md:w-[200px] text-right bg-white/90 border-gray-200">
                <SelectValue placeholder="בחר שחקן" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל השחקנים</SelectItem>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          מציג {filteredSummaries.length} מתוך {summaries.length} סיכומים
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredSummaries.length > 0 ? (
          <AnimatePresence>
            <motion.div 
              className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {filteredSummaries.map((summary, index) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-lg border border-gray-100 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="text-right w-full">
                          <CardTitle className="text-lg font-medium text-[#6E59A5]">
                            {summary.session?.player?.full_name || "שחקן לא ידוע"}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {format(new Date(summary.session?.session_date || new Date()), 'dd/MM/yyyy', { locale: he })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mr-2">
                          <FileText className="h-5 w-5 text-[#9b87f5]" />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors">
                                <Eye className="h-4 w-4 text-[#7E69AB] hover:text-[#6E59A5]" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-screen">
                              <DialogHeader>
                                <DialogTitle className="flex items-center justify-between mb-4 text-right">
                                  <span className="text-[#6E59A5]">סיכום מפגש - {summary.session?.player?.full_name || "שחקן לא ידוע"}</span>
                                  <span className="text-sm font-normal text-gray-500">
                                    {format(new Date(summary.session?.session_date || new Date()), 'dd/MM/yyyy', { locale: he })}
                                  </span>
                                </DialogTitle>
                              </DialogHeader>
                              {renderSummaryDetails(summary)}
                              <div className="flex items-center justify-between pt-4 border-t mt-4">
                                <div className="text-gray-600 text-right w-full">
                                  דירוג התקדמות: <span className="font-semibold text-[#6E59A5]">{summary.progress_rating}/5</span>
                                </div>
                                <DialogClose asChild>
                                  <Button variant="outline">סגור</Button>
                                </DialogClose>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-right">
                        {summary.tools_used && summary.tools_used.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {summary.tools_used.slice(0, 3).map((toolId, idx) => (
                              <Badge 
                                key={idx}
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                              >
                                {tools[toolId]?.name || 'כלי'}
                              </Badge>
                            ))}
                            {summary.tools_used.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                +{summary.tools_used.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-semibold mb-1 text-[#7E69AB]">סיכום המפגש</h3>
                          <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-2 rounded-lg">{summary.summary_text}</p>
                          
                          {summary.audio_url && (
                            <div className="mt-3">
                              <div className="flex items-center gap-1.5 mb-1.5 text-[#6E59A5]">
                                <Volume2 className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">הקלטת סיכום</span>
                              </div>
                              <audio 
                                controls 
                                src={summary.audio_url}
                                className="w-full h-8 rounded-md"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3 w-3 text-purple-500" />
                          <span className="text-xs text-purple-600">
                            {summary.tools_used.length} כלים מנטליים
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 text-xs">
                            {format(new Date(summary.created_at), 'HH:mm dd/MM/yyyy', { locale: he })}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${summary.progress_rating >= 4 ? 'bg-green-100 text-green-800' : 
                              summary.progress_rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            דירוג התקדמות: {summary.progress_rating}/5
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
        <motion.div 
          className="text-center py-12 bg-white/80 rounded-lg shadow-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו סיכומי מפגשים</h3>
          <p className="text-gray-500">
            {selectedPlayer !== 'all' 
              ? 'אין סיכומי מפגשים לשחקן זה' 
              : searchQuery 
                ? 'לא נמצאו תוצאות התואמות את החיפוש' 
                : 'לא נמצאו סיכומי מפגשים במערכת'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AllMeetingSummaries;
