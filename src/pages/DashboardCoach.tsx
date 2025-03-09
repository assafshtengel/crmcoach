<lov-code>
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, PieChart, UserPlus, CalendarPlus, Users, Calendar, BarChart2, Loader2, Send, Check, LogOut, ChevronDown, ChevronUp, Share2, FileEdit, Clock, AlertCircle, FileText, Eye, Plus, Target, ClipboardCheck, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, startOfMonth, endOfMonth, subMonths, isBefore, isAfter, isSameDay, isPast, formatDistance } from 'date-fns';
import { he } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SessionSummaryForm } from "@/components/session/SessionSummaryForm";
import { Calendar as CalendarComponent } from '@/components/calendar/Calendar';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tool } from '@/types/tool';
import AllMeetingSummaries from './AllMeetingSummaries';
import { SessionFormDialog } from '@/components/sessions/SessionFormDialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Film } from 'lucide-react';
import { AdminMessageForm } from '@/components/admin/AdminMessageForm';

const DashboardCoach = () => {
  const navigate = useNavigate();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [isSessionSummaryDialogOpen, setIsSessionSummaryDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [coach, setCoach] = useState<any>(null);
  const [players, setPlayers] = useState<any>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [isCollapsible2Open, setIsCollapsible2Open] = useState(false);
  const [isCollapsible3Open, setIsCollapsible3Open] = useState(false);
  const [isCollapsible4Open, setIsCollapsible4Open] = useState(false);
  const [isCollapsible5Open, setIsCollapsible5Open] = useState(false);
  const [isCollapsible6Open, setIsCollapsible6Open] = useState(false);
  const [isCollapsible7Open, setIsCollapsible7Open] = useState(false);
  const [isCollapsible8Open, setIsCollapsible8Open] = useState(false);
  const [isCollapsible9Open, setIsCollapsible9Open] = useState(false);
  const [isCollapsible10Open, setIsCollapsible10Open] = useState(false);
  const [isCollapsible11Open, setIsCollapsible11Open] = useState(false);
  const [isCollapsible12Open, setIsCollapsible12Open] = useState(false);
  const [isCollapsible13Open, setIsCollapsible13Open] = useState(false);
  const [isCollapsible14Open, setIsCollapsible14Open] = useState(false);
  const [isCollapsible15Open, setIsCollapsible15Open] = useState(false);
  const [isCollapsible16Open, setIsCollapsible16Open] = useState(false);
  const [isCollapsible17Open, setIsCollapsible17Open] = useState(false);
  const [isCollapsible18Open, setIsCollapsible18Open] = useState(false);
  const [isCollapsible19Open, setIsCollapsible19Open] = useState(false);
  const [isCollapsible20Open, setIsCollapsible20Open] = useState(false);
  const [isCollapsible21Open, setIsCollapsible21Open] = useState(false);
  const [isCollapsible22Open, setIsCollapsible22Open] = useState(false);
  const [isCollapsible23Open, setIsCollapsible23Open] = useState(false);
  const [isCollapsible24Open, setIsCollapsible24Open] = useState(false);
  const [isCollapsible25Open, setIsCollapsible25Open] = useState(false);
  const [isCollapsible26Open, setIsCollapsible26Open] = useState(false);
  const [isCollapsible27Open, setIsCollapsible27Open] = useState(false);
  const [isCollapsible28Open, setIsCollapsible28Open] = useState(false);
  const [isCollapsible29Open, setIsCollapsible29Open] = useState(false);
  const [isCollapsible30Open, setIsCollapsible30Open] = useState(false);
  const [isCollapsible31Open, setIsCollapsible31Open] = useState(false);
  const [isCollapsible32Open, setIsCollapsible32Open] = useState(false);
  const [isCollapsible33Open, setIsCollapsible33Open] = useState(false);
  const [isCollapsible34Open, setIsCollapsible34Open] = useState(false);
  const [isCollapsible35Open, setIsCollapsible35Open] = useState(false);
  const [isCollapsible36Open, setIsCollapsible36Open] = useState(false);
  const [isCollapsible37Open, setIsCollapsible37Open] = useState(false);
  const [isCollapsible38Open, setIsCollapsible38Open] = useState(false);
  const [isCollapsible39Open, setIsCollapsible39Open] = useState(false);
  const [isCollapsible40Open, setIsCollapsible40Open] = useState(false);
  const [isCollapsible41Open, setIsCollapsible41Open] = useState(false);
  const [isCollapsible42Open, setIsCollapsible42Open] = useState(false);
  const [isCollapsible43Open, setIsCollapsible43Open] = useState(false);
  const [isCollapsible44Open, setIsCollapsible44Open] = useState(false);
  const [isCollapsible45Open, setIsCollapsible45Open] = useState(false);
  const [isCollapsible46Open, setIsCollapsible46Open] = useState(false);
  const [isCollapsible47Open, setIsCollapsible47Open] = useState(false);
  const [isCollapsible48Open, setIsCollapsible48Open] = useState(false);
  const [isCollapsible49Open, setIsCollapsible49Open] = useState(false);
  const [isCollapsible50Open, setIsCollapsible50Open] = useState(false);
  const [isCollapsible51Open, setIsCollapsible51Open] = useState(false);
  const [isCollapsible52Open, setIsCollapsible52Open] = useState(false);
  const [isCollapsible53Open, setIsCollapsible53Open] = useState(false);
  const [isCollapsible54Open, setIsCollapsible54Open] = useState(false);
  const [isCollapsible55Open, setIsCollapsible55Open] = useState(false);
  const [isCollapsible56Open, setIsCollapsible56Open] = useState(false);
  const [isCollapsible57Open, setIsCollapsible57Open] = useState(false);
  const [isCollapsible58Open, setIsCollapsible58Open] = useState(false);
  const [isCollapsible59Open, setIsCollapsible59Open] = useState(false);
  const [isCollapsible60Open, setIsCollapsible60Open] = useState(false);
  const [isCollapsible61Open, setIsCollapsible61Open] = useState(false);
  const [isCollapsible62Open, setIsCollapsible62Open] = useState(false);
  const [isCollapsible63Open, setIsCollapsible63Open] = useState(false);
  const [isCollapsible64Open, setIsCollapsible64Open] = useState(false);
  const [isCollapsible65Open, setIsCollapsible65Open] = useState(false);
  const [isCollapsible66Open, setIsCollapsible66Open] = useState(false);
  const [isCollapsible67Open, setIsCollapsible67Open] = useState(false);
  const [isCollapsible68Open, setIsCollapsible68Open] = useState(false);
  const [isCollapsible69Open, setIsCollapsible69Open] = useState(false);
  const [isCollapsible70Open, setIsCollapsible70Open] = useState(false);
  const [isCollapsible71Open, setIsCollapsible71Open] = useState(false);
  const [isCollapsible72Open, setIsCollapsible72Open] = useState(false);
  const [isCollapsible73Open, setIsCollapsible73Open] = useState(false);
  const [isCollapsible74Open, setIsCollapsible74Open] = useState(false);
  const [isCollapsible75Open, setIsCollapsible75Open] = useState(false);
  const [isCollapsible76Open, setIsCollapsible76Open] = useState(false);
  const [isCollapsible77Open, setIsCollapsible77Open] = useState(false);
  const [isCollapsible78Open, setIsCollapsible78Open] = useState(false);
  const [isCollapsible79Open, setIsCollapsible79Open] = useState(false);
  const [isCollapsible80Open, setIsCollapsible80Open] = useState(false);
  const [isCollapsible81Open, setIsCollapsible81Open] = useState(false);
  const [isCollapsible82Open, setIsCollapsible82Open] = useState(false);
  const [isCollapsible83Open, setIsCollapsible83Open] = useState(false);
  const [isCollapsible84Open, setIsCollapsible84Open] = useState(false);
  const [isCollapsible85Open, setIsCollapsible85Open] = useState(false);
  const [isCollapsible86Open, setIsCollapsible86Open] = useState(false);
  const [isCollapsible87Open, setIsCollapsible87Open] = useState(false);
  const [isCollapsible88Open, setIsCollapsible88Open] = useState(false);
  const [isCollapsible89Open, setIsCollapsible89Open] = useState(false);
  const [isCollapsible90Open, setIsCollapsible90Open] = useState(false);
  const [isCollapsible91Open, setIsCollapsible91Open] = useState(false);
  const [isCollapsible92Open, setIsCollapsible92Open] = useState(false);
  const [isCollapsible93Open, setIsCollapsible93Open] = useState(false);
  const [isCollapsible94Open, setIsCollapsible94Open] = useState(false);
  const [isCollapsible95Open, setIsCollapsible95Open] = useState(false);
  const [isCollapsible96Open, setIsCollapsible96Open] = useState(false);
  const [isCollapsible97Open, setIsCollapsible97Open] = useState(false);
  const [isCollapsible98Open, setIsCollapsible98Open] = useState(false);
  const [isCollapsible99Open, setIsCollapsible99Open] = useState(false);
  const [isCollapsible100Open, setIsCollapsible100Open] = useState(false);
  const [isCollapsible101Open, setIsCollapsible101Open] = useState(false);
  const [isCollapsible102Open, setIsCollapsible102Open] = useState(false);
  const [isCollapsible103Open, setIsCollapsible103Open] = useState(false);
  const [isCollapsible104Open, setIsCollapsible104Open] = useState(false);
  const [isCollapsible105Open, setIsCollapsible105Open] = useState(false);
  const [isCollapsible106Open, setIsCollapsible106Open] = useState(false);
  const [isCollapsible107Open, setIsCollapsible107Open] = useState(false);
  const [isCollapsible108Open, setIsCollapsible108Open] = useState(false);
  const [isCollapsible109Open, setIsCollapsible109Open] = useState(false);
  const [isCollapsible110Open, setIsCollapsible110Open] = useState(false);
  const [isCollapsible111Open, setIsCollapsible111Open] = useState(false);
  const [isCollapsible112Open, setIsCollapsible112Open] = useState(false);
  const [isCollapsible113Open, setIsCollapsible113Open] = useState(false);
  const [isCollapsible114Open, setIsCollapsible114Open] = useState(false);
  const [isCollapsible115Open, setIsCollapsible115Open] = useState(false);
  const [isCollapsible116Open, setIsCollapsible116Open] = useState(false);
  const [isCollapsible117Open, setIsCollapsible117Open] = useState(false);
  const [isCollapsible118Open, setIsCollapsible118Open] = useState(false);
  const [isCollapsible119Open, setIsCollapsible119Open] = useState(false);
  const [isCollapsible120Open, setIsCollapsible120Open] = useState(false);
  const [isCollapsible121Open, setIsCollapsible121Open] = useState(false);
  const [isCollapsible122Open, setIsCollapsible122Open] = useState(false);
  const [isCollapsible123Open, setIsCollapsible123Open] = useState(false);
  const [isCollapsible124Open, setIsCollapsible124Open] = useState(false);
  const [isCollapsible125Open, setIsCollapsible125Open] = useState(false);
  const [isCollapsible126Open, setIsCollapsible126Open] = useState(false);
  const [isCollapsible127Open, setIsCollapsible127Open] = useState(false);
  const [isCollapsible128Open, setIsCollapsible128Open] = useState(false);
  const [isCollapsible129Open, setIsCollapsible129Open] = useState(false);
  const [isCollapsible130Open, setIsCollapsible130Open] = useState(false);
  const [isCollapsible131Open, setIsCollapsible131Open] = useState(false);
  const [isCollapsible132Open, setIsCollapsible132Open] = useState(false);
  const [isCollapsible133Open, setIsCollapsible133Open] = useState(false);
  const [isCollapsible134Open, setIsCollapsible134Open] = useState(false);
  const [isCollapsible135Open, setIsCollapsible135Open] = useState(false);
  const [isCollapsible136Open, setIsCollapsible136Open] = useState(false);
  const [isCollapsible137Open, setIsCollapsible137Open] = useState(false);
  const [isCollapsible138Open, setIsCollapsible138Open] = useState(false);
  const [isCollapsible139Open, setIsCollapsible139Open] = useState(false);
  const [isCollapsible140Open, setIsCollapsible140Open] = useState(false);
  const [isCollapsible141Open, setIsCollapsible141Open] = useState(false);
  const [isCollapsible142Open, setIsCollapsible142Open] = useState(false);
  const [isCollapsible143Open, setIsCollapsible143Open] = useState(false);
  const [isCollapsible144Open, setIsCollapsible144Open] = useState(false);
  const [isCollapsible145Open, setIsCollapsible145Open] = useState(false);
  const [isCollapsible146Open, setIsCollapsible146Open] = useState(false);
  const [isCollapsible147Open, setIsCollapsible147Open] = useState(false);
  const [isCollapsible148Open, setIsCollapsible148Open] = useState(false);
  const [isCollapsible149Open, setIsCollapsible149Open] = useState(false);
  const [isCollapsible150Open, setIsCollapsible150Open] = useState(false);
  const [isCollapsible151Open, setIsCollapsible151Open] = useState(false);
  const [isCollapsible152Open, setIsCollapsible152Open] = useState(false);
  const [isCollapsible153Open, setIsCollapsible153Open] = useState(false);
  const [isCollapsible154Open, setIsCollapsible154Open] = useState(false);
  const [isCollapsible155Open, setIsCollapsible155Open] = useState(false);
  const [isCollapsible156Open, setIsCollapsible156Open] = useState(false);
  const [isCollapsible157Open, setIsCollapsible157Open] = useState(false);
  const [isCollapsible158Open, setIsCollapsible158Open] = useState(false);
  const [isCollapsible159Open, setIsCollapsible159Open] = useState(false);
  const [isCollapsible160Open, setIsCollapsible160Open] = useState(false);
  const [isCollapsible161Open, setIsCollapsible161Open] = useState(false);
  const [isCollapsible162Open, setIsCollapsible162Open] = useState(false);
  const [isCollapsible163Open, setIsCollapsible163Open] = useState(false);
  const [isCollapsible164Open, setIsCollapsible164Open] = useState(false);
  const [isCollapsible165Open, setIsCollapsible165Open] = useState(false);
  const [isCollapsible166Open, setIsCollapsible166Open] = useState(false);
  const [isCollapsible167Open, setIsCollapsible167Open] = useState(false);
  const [isCollapsible168Open, setIsCollapsible168Open] = useState(false);
  const [isCollapsible169Open, setIsCollapsible169Open] = useState(false);
  const [isCollapsible170Open, setIsCollapsible170Open] = useState(false);
  const [isCollapsible171Open, setIsCollapsible171Open] = useState(false);
  const [isCollapsible172Open, setIsCollapsible172Open] = useState(false);
  const [isCollapsible173Open, setIsCollapsible173Open] = useState(false);
  const [isCollapsible174Open, setIsCollapsible174Open] = useState(false);
  const [isCollapsible175Open, setIsCollapsible175Open] = useState(false);
  const [isCollapsible176Open, setIsCollapsible176Open] = useState(false);
  const [isCollapsible177Open, setIsCollapsible177Open] = useState(false);
  const [isCollapsible178Open, setIsCollapsible178Open] = useState(false);
  const [isCollapsible179Open, setIsCollapsible179Open] = useState(false);
  const [isCollapsible180Open, setIsCollapsible180Open] = useState(false);
  const [isCollapsible181Open, setIsCollapsible181Open] = useState(false);
  const [isCollapsible182Open, setIsCollapsible182Open] = useState(false);
  const [isCollapsible183Open, setIsCollapsible183Open] = useState(false);
  const [isCollapsible184Open, setIsCollapsible184Open] = useState(false);
  const [isCollapsible185Open, setIsCollapsible185Open] = useState(false);
  const [isCollapsible186Open, setIsCollapsible186Open] = useState(false);
  const [isCollapsible187Open, setIsCollapsible187Open] = useState(false);
  const [isCollapsible188Open, setIsCollapsible188Open] = useState(false);
  const [isCollapsible189Open, setIsCollapsible189Open] = useState(false);
  const [isCollapsible190Open, setIsCollapsible190Open] = useState(false);
  const [isCollapsible191Open, setIsCollapsible191Open] = useState(false);
  const [isCollapsible192Open, setIsCollapsible192Open] = useState(false);
  const [isCollapsible193Open, setIsCollapsible193Open] = useState(false);
  const [isCollapsible194Open, setIsCollapsible194Open] = useState(false);
  const [isCollapsible195Open, setIsCollapsible195Open] = useState(false);
  const [isCollapsible196Open, setIsCollapsible196Open] = useState(false);
  const [isCollapsible197Open, setIsCollapsible197Open] = useState(false);
  const [isCollapsible198Open, setIsCollapsible198Open] = useState(false);
  const [isCollapsible199Open, setIsCollapsible199Open] = useState(false);
  const [isCollapsible200Open, setIsCollapsible200Open] = useState(false);
  const [isCollapsible201Open, setIsCollapsible201Open] = useState(false);
  const [isCollapsible202Open, setIsCollapsible202Open] = useState(false);
  const [isCollapsible203Open, setIsCollapsible203Open] = useState(false);
  const [isCollapsible204Open, setIsCollapsible204Open] = useState(false);
  const [isCollapsible205Open, setIsCollapsible205Open] = useState(false);
  const [isCollapsible206Open, setIsCollapsible206Open] = useState(false);
  const [isCollapsible207Open, setIsCollapsible207Open] = useState(false);
  const [isCollapsible208Open, setIsCollapsible208Open] = useState(false);
  const [isCollapsible209Open, setIsCollapsible209Open] = useState(false);
  const [isCollapsible210Open, setIsCollapsible210Open] = useState(false);
  const [isCollapsible211Open, setIsCollapsible211Open] = useState(false);
  const [isCollapsible212Open, setIsCollapsible212Open] = useState(false);
  const [isCollapsible213Open, setIsCollapsible213Open] = useState(false);
  const [isCollapsible214Open, setIsCollapsible214Open] = useState(false);
  const [isCollapsible215Open, setIsCollapsible215Open] = useState(false);
  const [isCollapsible216Open, setIsCollapsible216Open] = useState(false);
  const [isCollapsible217Open, setIsCollapsible217Open] = useState(false);
  const [isCollapsible218Open, setIsCollapsible218Open] = useState(false);
  const [isCollapsible219Open, setIsCollapsible219Open] = useState(false);
  const [isCollapsible220Open, setIsCollapsible220Open] = useState(false);
  const [isCollapsible221Open, setIsCollapsible221Open] = useState(false);
  const [isCollapsible222Open, setIsCollapsible222Open] = useState(false);
  const [isCollapsible223Open, setIsCollapsible223Open] = useState(false);
  const [isCollapsible224Open, setIsCollapsible224Open] = useState(false);
  const [isCollapsible225Open, setIsCollapsible225Open] = useState(false);
  const [isCollapsible226Open, setIsCollapsible226Open] = useState(false);
  const [isCollapsible227Open, setIsCollapsible227Open] = useState(false);
  const [isCollapsible228Open, setIsCollapsible228Open] = useState(false);
  const [isCollapsible229Open, setIsCollapsible229Open] = useState(false);
  const [isCollapsible230Open, setIsCollapsible230Open] = useState(false);
  const [isCollapsible231Open, setIsCollapsible231Open] = useState(false);
  const [isCollapsible232Open, setIsCollapsible232Open] = useState(false);
  const [isCollapsible233Open, setIsCollapsible233Open] = useState(false);
  const [isCollapsible234Open, setIsCollapsible234Open] = useState(false);
  const [isCollapsible235Open, setIsCollapsible235Open] = useState(false);
  const [isCollapsible236Open, setIsCollapsible236Open] = useState(false);
  const [isCollapsible237Open, setIsCollapsible237Open] = useState(false);
  const [isCollapsible238Open, setIsCollapsible238Open] = useState(false);
  const [isCollapsible239Open, setIsCollapsible239Open] = useState(false);
  const [isCollapsible240Open, setIsCollapsible240Open] = useState(false);
  const [isCollapsible241Open, setIsCollapsible241Open] = useState(false);
  const [isCollapsible242Open, setIsCollapsible242Open] = useState(false);
  const [isCollapsible243Open, setIsCollapsible243Open] = useState(false);
  const [isCollapsible244Open, setIsCollapsible244Open] = useState(false);
  const [isCollapsible245Open, setIsCollapsible245Open] = useState(false);
  const [isCollapsible246Open, setIsCollapsible246Open] = useState(false);
  const [isCollapsible247Open, setIsCollapsible247Open] = useState(false);
  const [isCollapsible248Open, setIsCollapsible248Open] = useState(false);
  const [isCollapsible249Open, setIsCollapsible249Open] = useState(false);
  const [isCollapsible250Open, setIsCollapsible250Open] = useState(false);
  const [isCollapsible251Open, setIsCollapsible251Open] = useState(false);
  const [isCollapsible252Open, setIsCollapsible252Open] = useState(false);
  const [isCollapsible253Open, setIsCollapsible253Open] = useState(false);
  const [isCollapsible254Open, setIsCollapsible254Open] = useState(false);
  const [isCollapsible255Open, setIsCollapsible255Open] = useState(false);
  const [isCollapsible256Open, setIsCollapsible256Open] = useState(false);
  const [isCollapsible257Open, setIsCollapsible257Open] = useState(false);
  const [isCollapsible258Open, setIsCollapsible258Open] = useState(false);
  const [isCollapsible259Open, setIsCollapsible259Open] = useState(false);
  const [isCollapsible260Open, setIsCollapsible260Open] = useState(false);
  const [isCollapsible261Open, setIsCollapsible261Open] = useState(false);
  const [isCollapsible262Open, setIsCollapsible262Open] = useState(false);
  const [isCollapsible263Open, setIsCollapsible263Open] = useState(false);
  const [isCollapsible264Open, setIsCollapsible264Open] = useState(false);
  const [isCollapsible265Open, setIsCollapsible265Open] = useState(false);
  const [isCollapsible266Open, setIsCollapsible266Open] = useState(false);
  const [isCollapsible267Open, setIsCollapsible267Open] = useState(false);
  const [isCollapsible268Open, setIsCollapsible268Open] = useState(false);
  const [isCollapsible269Open, setIsCollapsible269Open] = useState(false);
  const [isCollapsible270Open, setIsCollapsible270Open] = useState(false);
  const [isCollapsible271Open, setIsCollapsible271Open] = useState(false);
  const [isCollapsible272Open, setIsCollapsible272Open] = useState(false);
  const [isCollapsible273Open, setIsCollapsible273Open] = useState(false);
  const [isCollapsible274Open, setIsCollapsible274Open] = useState(false);
  const [isCollapsible275Open, setIsCollapsible275Open] = useState(false);
  const [isCollapsible276Open, setIsCollapsible276Open] = useState(false);
  const [isCollapsible277Open, setIsCollapsible277Open] = useState(false);
  const [isCollapsible278Open, setIsCollapsible278Open] = useState(false);
  const [isCollapsible279Open, setIsCollapsible279Open] = useState(false);
  const [isCollapsible280Open, setIsCollapsible280Open] = useState(false);
  const [isCollapsible281Open, setIsCollapsible281Open] = useState(false);
  const [isCollapsible282Open, setIsCollapsible282Open] = useState(false);
  const [isCollapsible283Open, setIsCollapsible283Open] = useState(false);
  const [isCollapsible284Open, setIsCollapsible284Open] = useState(false);
  const [isCollapsible285Open, setIsCollapsible285Open] = useState(false);
  const [isCollapsible286Open, setIsCollapsible286Open] = useState(false);
  const [isCollapsible287Open, setIsCollapsible287Open] = useState(false);
  const [isCollapsible288Open, setIsCollapsible288Open] = useState(false);
  const [isCollapsible289Open, setIsCollapsible289Open] = useState(false);
  const [isCollapsible290Open, setIsCollapsible290Open] = useState(false);
  const [isCollapsible291Open, setIsCollapsible291Open] = useState(false);
  const [isCollapsible292Open, setIsCollapsible292Open] = useState(false);
  const [isCollapsible293Open, setIsCollapsible293Open] = useState(false);
  const [isCollapsible294Open, setIsCollapsible294Open] = useState(false);
  const [isCollapsible295Open, setIsCollapsible295Open] = useState(false);
  const [isCollapsible296Open, setIsCollapsible296Open] = useState(false);
  const [isCollapsible297Open, setIsCollapsible297Open] = useState(false);
  const [isCollapsible298Open, setIsCollapsible298Open] = useState(false);
  const [isCollapsible299Open, setIsCollapsible299Open] = useState(false);
  const [isCollapsible300Open, setIsCollapsible300Open] = useState(false);
  const [isCollapsible301Open, setIsCollapsible301Open] = useState(false);
  const [isCollapsible302Open, setIsCollapsible302Open] = useState(false);
  const [isCollapsible303Open, setIsCollapsible303Open] = useState(false);
  const [isCollapsible304Open, setIsCollapsible304Open] = useState(false);
  const [isCollapsible305Open, setIsCollapsible305Open] = useState(false);
  const [isCollapsible306Open, setIsCollapsible306Open] = useState(false);
  const [isCollapsible307Open, setIs
