import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Folder } from "lucide-react";

interface Player {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  profile_image: string | null;
  club: string | null;
  city: string | null;
  sport_field: string | null;
  coach_id: string | null;
}

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setPlayers(data as Player[]);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.full_name.toLowerCase().includes(search.toLowerCase()) ||
    player.email.toLowerCase().includes(search.toLowerCase())
  );

  const deletePlayer = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        setPlayers(prev => prev.filter(player => player.id !== id));
        toast.success('Player deleted successfully.');
      } catch (error) {
        console.error('Error deleting player:', error);
        toast.error('Failed to delete player.');
      }
    }
  };

  const renderPlayerRow = (player: Player) => {
    return (
      <TableRow key={player.id}>
        <TableCell>{player.full_name}</TableCell>
        <TableCell>{player.email}</TableCell>
        <TableCell>{player.phone || 'N/A'}</TableCell>
        <TableCell>{player.club || 'N/A'}</TableCell>
        <TableCell>{player.city || 'N/A'}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="ghost" size="icon" title="Edit">
              <Link to={`/edit-player/${player.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" title="Delete" onClick={() => deletePlayer(player.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Link to={`/player-file/${player.id}`}>
              <Button variant="ghost" size="icon" title="תיק שחקן">
                <Folder className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Players List</h1>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Input
              type="search"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/add-player">
              <Button><UserPlus className="h-4 w-4 mr-2" /> Add Player</Button>
            </Link>
          </div>
        </div>

        <Table>
          <TableCaption>A list of all players in your account.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading players...</TableCell>
              </TableRow>
            ) : filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No players found.</TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map(renderPlayerRow)
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
};

export default PlayersList;
