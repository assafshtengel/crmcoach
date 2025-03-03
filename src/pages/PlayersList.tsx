import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PlayerAccessDetails } from "@/components/players/PlayerAccessDetails";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PlayersList = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [newPlayer, setNewPlayer] = useState({ full_name: '', email: '' });
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [editedPlayer, setEditedPlayer] = useState({ full_name: '', email: '' });
  const [deletePlayerId, setDeletePlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*');

      if (error) {
        console.error("Error fetching players:", error);
        toast({
          title: "Error",
          description: "Failed to fetch players.",
          variant: "destructive",
        });
      } else {
        setPlayers(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching players:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while fetching players.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayer.full_name || !newPlayer.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .insert([{ ...newPlayer, coach_id: session.session.user.id }])
        .select()

      if (error) {
        console.error("Error creating player:", error);
        toast({
          title: "Error",
          description: "Failed to create player.",
          variant: "destructive",
        });
      } else {
        setPlayers([...players, data[0]]);
        setNewPlayer({ full_name: '', email: '' });
        toast({
          title: "Success",
          description: "Player created successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error creating player:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the player.",
        variant: "destructive",
      });
    } finally {
      fetchPlayers();
    }
  };

  const handleEditPlayer = (player: any) => {
    setEditPlayerId(player.id);
    setEditedPlayer({ full_name: player.full_name, email: player.email });
  };

  const handleUpdatePlayer = async () => {
    if (!editedPlayer.full_name || !editedPlayer.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .update(editedPlayer)
        .eq('id', editPlayerId);

      if (error) {
        console.error("Error updating player:", error);
        toast({
          title: "Error",
          description: "Failed to update player.",
          variant: "destructive",
        });
      } else {
        setPlayers(
          players.map((player) =>
            player.id === editPlayerId ? { ...player, ...editedPlayer } : player
          )
        );
        setEditPlayerId(null);
        setEditedPlayer({ full_name: '', email: '' });
        toast({
          title: "Success",
          description: "Player updated successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error updating player:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while updating the player.",
        variant: "destructive",
      });
    } finally {
      fetchPlayers();
    }
  };

  const handleDeletePlayer = (id: string) => {
    setDeletePlayerId(id);
  };

  const confirmDeletePlayer = async () => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', deletePlayerId);

      if (error) {
        console.error("Error deleting player:", error);
        toast({
          title: "Error",
          description: "Failed to delete player.",
          variant: "destructive",
        });
      } else {
        setPlayers(players.filter((player) => player.id !== deletePlayerId));
        setDeletePlayerId(null);
        toast({
          title: "Success",
          description: "Player deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error deleting player:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while deleting the player.",
        variant: "destructive",
      });
    } finally {
      fetchPlayers();
    }
  };

  const cancelDeletePlayer = () => {
    setDeletePlayerId(null);
  };

  const renderActions = (player: any) => {
    return (
      <div className="flex items-center gap-2">
        {editPlayerId === player.id ? (
          <>
            <Button size="sm" onClick={handleUpdatePlayer}>
              Update
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditPlayerId(null)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(player)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the player
                    from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelDeletePlayer}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeletePlayer}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              פרטי גישה לשחקן
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white" align="end">
            <PlayerAccessDetails player={player} />
          </PopoverContent>
        </Popover>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Players List</h1>

      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-2">Create New Player</h2>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Full Name"
            value={newPlayer.full_name}
            onChange={(e) => setNewPlayer({ ...newPlayer, full_name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={newPlayer.email}
            onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
          />
          <Button onClick={handleCreatePlayer}>
            <Plus className="mr-2 h-4 w-4" />
            Create Player
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading players...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of your players.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.id}</TableCell>
                  <TableCell>
                    {editPlayerId === player.id ? (
                      <Input
                        type="text"
                        value={editedPlayer.full_name}
                        onChange={(e) =>
                          setEditedPlayer({ ...editedPlayer, full_name: e.target.value })
                        }
                      />
                    ) : (
                      player.full_name
                    )}
                  </TableCell>
                  <TableCell>
                    {editPlayerId === player.id ? (
                      <Input
                        type="email"
                        value={editedPlayer.email}
                        onChange={(e) =>
                          setEditedPlayer({ ...editedPlayer, email: e.target.value })
                        }
                      />
                    ) : (
                      player.email
                    )}
                  </TableCell>
                  <TableCell className="text-right">{renderActions(player)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletePlayerId && (
        <AlertDialog open={!!deletePlayerId} onOpenChange={() => setDeletePlayerId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this player? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDeletePlayer}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePlayer}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default PlayersList;
