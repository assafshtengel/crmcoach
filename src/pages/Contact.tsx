
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Instagram, Facebook, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="ml-2">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">פרטי קשר</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>אסף מזרחי</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">מאמן מנטלי מוסמך ומומחה בפסיכולוגיית ספורט</p>
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>טלפון יתווסף בהמשך</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>אימייל יתווסף בהמשך</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>רשתות חברתיות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <a 
                  href="https://www.instagram.com/asafmiz10/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Instagram className="h-6 w-6 text-pink-600" />
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-sm text-gray-600">@asafmiz10</p>
                  </div>
                </a>

                <a 
                  href="https://www.facebook.com/asafmental/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-sm text-gray-600">Asaf Mizrahi</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
