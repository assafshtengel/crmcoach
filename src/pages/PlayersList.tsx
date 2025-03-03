
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Pencil, UserPlus, Search, X, ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Player {
  id: string;
  full_name: string;
  club?: string;
  year_group?: string;
  email: string;
  profile_image?: string;
  sport_field?: string;
}

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 12;

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = players.filter(player => 
        player.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.club && player.club.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (player.sport_field && player.sport_field.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPlayers(filtered);
      setCurrentPage(1); // Reset to first page on search
    } else {
      setFilteredPlayers(players);
    }
  }, [searchQuery, players]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('coach_id', user.id)
        .order('full_name');

      if (error) throw error;

      setPlayers(data || []);
      setFilteredPlayers(data || []);
    } catch (error: any) {
      console.error('Error fetching players:', error);
      toast.error('שגיאה בטעינת רשימת השחקנים');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (playerId: string) => {
    navigate(`/player-profile/${playerId}`);
  };

  const handleEditPlayer = (playerId: string) => {
    navigate(`/edit-player/${playerId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">רשימת השחקנים</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-8">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="חיפוש שחקנים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right w-full sm:w-80"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button 
            onClick={() => navigate('/new-player')}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            הוספת שחקן חדש
          </Button>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 mb-4">לא נמצאו שחקנים</div>
            <Button onClick={() => navigate('/new-player')}>הוספת שחקן</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentPlayers.map((player) => (
                <Card 
                  key={player.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-0">
                    <div 
                      className="cursor-pointer" 
                      onClick={() => handleViewProfile(player.id)}
                    >
                      <div className="h-32 bg-gray-100 relative">
                        {player.profile_image ? (
                          <img 
                            src={player.profile_image} 
                            alt={player.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(player.full_name);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500 text-lg">{player.full_name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                        )}
                        {player.sport_field && (
                          <Badge className="absolute bottom-2 right-2 bg-white text-gray-800">
                            {player.sport_field}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{player.full_name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProfile(player.id)}>
                                צפייה בפרופיל
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPlayer(player.id)}>
                                <Pencil className="h-4 w-4 ml-2" />
                                עריכת פרטים
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {player.club && player.year_group ? (
                            <span>
                              {player.club} • {player.year_group}
                            </span>
                          ) : player.club ? (
                            <span>{player.club}</span>
                          ) : player.year_group ? (
                            <span>{player.year_group}</span>
                          ) : (
                            <span>לא צוין מועדון</span>
                          )}
                        </p>
                        <p className="text-gray-500 text-sm mt-2" dir="ltr">
                          {player.email}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 pb-4 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleEditPlayer(player.id)}
                      >
                        <Pencil className="h-4 w-4 ml-2" />
                        עריכת שחקן
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <Button
                      key={number}
                      variant={currentPage === number ? "default" : "outline"}
                      size="sm"
                      onClick={() => paginate(number)}
                      className="w-8 h-8 p-0"
                    >
                      {number}
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayersList;
