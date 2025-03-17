
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Link } from 'react-router-dom';

export function DashboardCoach() {
  const [coachName, setCoachName] = useState<string>('');

  useEffect(() => {
    const fetchCoachName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data: coachData, error } = await supabase
            .from('coaches')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching coach name:', error);
            setCoachName('מאמן');
          } else {
            setCoachName(coachData?.full_name || 'מאמן');
          }
        } catch (error) {
          console.error('Error fetching coach name:', error);
          setCoachName('מאמן');
        }
      } else {
        setCoachName('מאמן');
      }
    };

    fetchCoachName();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-[#2a3c6d] to-[#5862af] pt-10 pb-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">שלום, {coachName}</h1>
          <p className="mt-2 text-lg">ברוך הבא למערכת ניהול המאמן</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-100">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-emerald-600" />
                  הודעות ועדכונים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-right mb-4">
                  <p className="text-sm text-gray-600">הודעות חשובות ועדכונים ממערכת ניהול המאמן</p>
                </div>
                <Button variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
                  צפה בהודעות
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  סיכומי מפגשים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-right mb-4">
                  <p className="text-sm text-gray-600">צפה בכל סיכומי המפגשים שיצרת עבור שחקנים, וסכם מפגשים חדשים</p>
                </div>
                <Link to="/session-summaries">
                  <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300">
                    צפה בסיכומי מפגשים
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-600" />
                  ניהול שחקנים
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-right mb-4">
                  <p className="text-sm text-gray-600">הוסף, ערוך ונהל את רשימת השחקנים שלך</p>
                </div>
                <Link to="/players-list">
                  <Button variant="outline" className="w-full border-orange-200 hover:bg-orange-50 hover:border-orange-300">
                    עבור לרשימת שחקנים
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-sky-100">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  ניהול פגישות
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-right mb-4">
                  <p className="text-sm text-gray-600">צפה ונהל את הפגישות הקרובות וההיסטוריות שלך</p>
                </div>
                <Link to="/sessions-list">
                  <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 hover:border-blue-300">
                    עבור לרשימת פגישות
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">סטטיסטיקות מהירות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">סה"כ שחקנים</span>
                    <span className="font-semibold">25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">פגישות החודש</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ממוצע שעות אימון</span>
                    <span className="font-semibold">1.5 שעות</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">תזכורות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">פגישה עם שחקן חדש ביום ראשון</span>
                    <Button variant="ghost" size="sm">
                      פרטים
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">תשלום אחרון לשבוע זה</span>
                    <Button variant="ghost" size="sm">
                      שלם
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCoach;
