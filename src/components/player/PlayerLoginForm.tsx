
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'נדרשת סיסמה'),
});

interface PlayerLoginFormProps {
  playerId?: string;
}

const PlayerLoginForm = ({ playerId }: PlayerLoginFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Check if player with email and password exists
      const { data, error } = await supabase
        .from('players')
        .select('id, email, password')
        .eq('email', values.email.toLowerCase().trim())
        .eq('password', values.password)
        .single();
      
      if (error || !data) {
        toast.error('האימייל או הסיסמה שגויים');
        return;
      }
      
      // If specific playerId provided, check if it matches
      if (playerId && data.id !== playerId) {
        toast.error('אין לך גישה לפרופיל זה');
        return;
      }
      
      // Successful login
      toast.success('התחברת בהצלחה');
      
      // Store player session info in localStorage
      localStorage.setItem('playerSession', JSON.stringify({
        playerId: data.id,
        playerEmail: data.email,
        loggedInAt: new Date().toISOString(),
      }));
      
      // Navigate to player profile
      navigate(`/dashboard/player-profile/${data.id}`);
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('שגיאה בהתחברות');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">כניסת שחקן</CardTitle>
        <CardDescription className="text-center">
          אנא הזן את האימייל והסיסמה שקיבלת מהמאמן שלך
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>אימייל</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      dir="ltr"
                      autoComplete="email"
                    />
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="הזן את הסיסמה שלך"
                        {...field}
                        dir="ltr"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <p className="text-sm text-gray-500">
          שכחת את הסיסמה? פנה למאמן שלך
        </p>
      </CardFooter>
    </Card>
  );
};

export default PlayerLoginForm;
