
import React from "react";
import { useForm } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { RatingControl } from "@/components/ui/rating";
import { SelectedTools } from "./SelectedTools";

export function SummaryTab({ form, selectedTools = [] }) {
  return (
    <div className="space-y-6">
      {selectedTools && selectedTools.length > 0 && (
        <SelectedTools toolIds={selectedTools} />
      )}
      
      <FormField
        control={form.control}
        name="summary_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">סיכום המפגש</FormLabel>
            <FormControl>
              <Textarea
                placeholder="כתוב את סיכום המפגש כאן..."
                className="min-h-32 text-base leading-relaxed"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Tabs defaultValue="achieved" className="w-full">
        <TabsList className="justify-start mb-3 bg-muted/30">
          <TabsTrigger value="achieved">מטרות שהושגו</TabsTrigger>
          <TabsTrigger value="future">מטרות להמשך</TabsTrigger>
        </TabsList>

        <TabsContent value="achieved" className="space-y-4">
          <FormField
            control={form.control}
            name="achieved_goals"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  מטרות שהושגו במפגש
                </FormLabel>
                <FormDescription>
                  רשום את המטרות שהושגו במהלך המפגש
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="פרט את המטרות שהושגו, שורה לכל מטרה"
                    className="min-h-24 text-base leading-relaxed"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="future" className="space-y-4">
          <FormField
            control={form.control}
            name="future_goals"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  מטרות להמשך
                </FormLabel>
                <FormDescription>
                  רשום את המטרות להמשך העבודה
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="פרט את המטרות להמשך, שורה לכל מטרה"
                    className="min-h-24 text-base leading-relaxed"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="next_session_focus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                פוקוס למפגש הבא
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="הכנס את הפוקוס למפגש הבא"
                  className="text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="progress_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                דירוג התקדמות
              </FormLabel>
              <FormDescription>
                דרג את ההתקדמות של השחקן בסולם מ-1 עד 5
              </FormDescription>
              <FormControl>
                <RatingControl
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="additional_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">
              הערות נוספות (אופציונלי)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="הוסף הערות נוספות..."
                className="min-h-24 text-base leading-relaxed"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
