
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Instagram, Facebook, Mail, Phone, Globe, BrandTiktok } from "lucide-react";
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
          <h1 className="text-2xl font-bold">צור קשר</h1>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>אסף שטנגל</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">מאמן מנטלי מוסמך ומומחה בפסיכולוגיית ספורט</p>
              <div className="space-y-4">
                <a href="tel:0504039978" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>050-4039978</span>
                </a>
                <a href="mailto:socr.co.il@gmail.com" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>socr.co.il@gmail.com</span>
                </a>
                <a 
                  href="https://www.shtengel.co.il/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-5 w-5 text-primary" />
                  <span>www.shtengel.co.il</span>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>רשתות חברתיות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <a 
                  href="https://www.instagram.com/ashtengel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Instagram className="h-6 w-6 text-pink-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-sm text-gray-600">@ashtengel</p>
                  </div>
                </a>

                <a 
                  href="https://www.facebook.com/asaf.shtengel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Facebook className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium">Facebook אישי</p>
                    <p className="text-sm text-gray-600">Asaf Shtengel</p>
                  </div>
                </a>

                <a 
                  href="https://www.facebook.com/israel.mental/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Facebook className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium">Facebook עסקי</p>
                    <p className="text-sm text-gray-600">Mental Training Israel</p>
                  </div>
                </a>

                <a 
                  href="https://www.tiktok.com/@ashtengel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <svg 
                    className="h-6 w-6 group-hover:scale-110 transition-transform" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 19.357 4a9.363 9.363 0 0 1-2.056 2.366A9.258 9.258 0 0 1 15.5 4.5a9.339 9.339 0 0 1 1.1 1.32Z" fill="#FF004F"/>
                    <path d="M15.5 4.5a9.339 9.339 0 0 1 1.1 1.32A4.278 4.278 0 0 1 19.357 4a9.363 9.363 0 0 1-2.056 2.366A9.258 9.258 0 0 1 15.5 4.5Z" fill="#FF004F"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.5 5.5v10.25a4.75 4.75 0 1 1-4.75-4.75h1.85V8.37H5.75A7.37 7.37 0 1 0 13.12 15.74V8.37A7.37 7.37 0 0 0 18.5 5.5h-2.62V2.88A7.37 7.37 0 0 0 10.5 5.5Z" fill="#000000"/>
                  </svg>
                  <div>
                    <p className="font-medium">TikTok</p>
                    <p className="text-sm text-gray-600">@ashtengel</p>
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
