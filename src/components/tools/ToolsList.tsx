import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
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
import { Tool } from '@/types/tool';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "שם הכלי חייב להכיל לפחות 2 תווים.",
  }),
  description: z.string().optional(),
})

export function ToolsList() {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange"
  })

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coach_tools')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setTools(data);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createTool(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from('coach_tools')
        .insert([values])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "הכלי נוצר בהצלחה!",
        })
        fetchTools();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "אופס! משהו השתבש.",
        description: error.message,
      })
    } finally {
      setOpen(false);
      form.reset();
    }
  }

  async function updateTool(id: string, values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from('coach_tools')
        .update(values)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "הכלי עודכן בהצלחה!",
        })
        fetchTools();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "אופס! משהו השתבש.",
        description: error.message,
      })
    } finally {
      setOpen(false);
      form.reset();
    }
  }

  async function deleteTool(id: string) {
    try {
      const { error } = await supabase
        .from('coach_tools')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "הכלי נמחק בהצלחה!",
      })
      fetchTools();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "אופס! משהו השתבש.",
        description: error.message,
      })
    }
  }

  const handleOpenChange = () => {
    setOpen(!open);
    setIsEditMode(false);
    setSelectedTool(null);
    form.reset();
  };

  const handleEdit = (tool: Tool) => {
    setSelectedTool(tool);
    setIsEditMode(true);
    setOpen(true);
    form.setValue("name", tool.name);
    form.setValue("description", tool.description || "");
  };

  const handleDelete = (id: string) => {
    deleteTool(id);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditMode && selectedTool) {
      updateTool(selectedTool.id, values);
    } else {
      createTool(values);
    }
  }

  return (
    <>
      <div className="md:flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">רשימת כלים</h2>
        <Button onClick={handleOpenChange}>
          <PlusCircle className="w-4 h-4 mr-2" />
          הוסף כלי חדש
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "ערוך כלי" : "צור כלי"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "ערוך את שם הכלי והתיאור שלו כאן. לחץ על שמור כשסיימת."
                : "הוסף כלי חדש לשימוש חוזר."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם הכלי</FormLabel>
                    <FormControl>
                      <Input placeholder="שם הכלי" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תיאור</FormLabel>
                    <FormControl>
                      <Input placeholder="תיאור" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{isEditMode ? "שמור" : "צור"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <TableCaption>רשימת כלים לשימוש חוזר.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">שם</TableHead>
              <TableHead>תיאור</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">טוען...</TableCell>
              </TableRow>
            ) : tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">אין כלים</TableCell>
              </TableRow>
            ) : (
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>{tool.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(tool)}>
                      <Edit className="w-4 h-4 mr-2" />
                      ערוך
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tool.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      מחק
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
