
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(1, { message: "יש להזין שם משתמש" }),
  password: z.string().min(1, { message: "יש להזין סיסמה" }),
});

type FormData = z.infer<typeof formSchema>;

const PlayerAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Authenticate user with Supabase
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('username', data.username)
        .eq('password', data.password)
        .single();

      if (playerError || !playerData) {
        throw new Error("שם משתמש או סיסמה שגויים");
      }

      // Store player session in localStorage
      localStorage.setItem('playerSession', JSON.stringify(playerData));
      
      toast({
        title: "התחברת בהצלחה",
        description: `ברוך הבא, ${playerData.full_name}`,
      });
      
      navigate('/player-profile');
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בהתחברות",
        description: error.message || "אירעה שגיאה בהתחברות, אנא נסה שנית",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">התחברות שחקן</CardTitle>
          <CardDescription>הזן את פרטי הכניסה שלך להתחברות</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם משתמש</FormLabel>
                    <FormControl>
                      <Input placeholder="הזן שם משתמש" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סיסמה</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="הזן סיסמה" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "מתחבר..." : "התחבר"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerAuth;
