import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  purchaseUrl: string;
  category: string;
  rating: number;
  price: string;
}

const recommendedBooks: Book[] = [
  {
    id: 1,
    title: "בכוח הרצון",
    author: "טל בן חיים",
    description: "בספר \"בכוח הרצון\" יצטרפו הקוראים למסע המטלטל שעבר טל בן חיים דרך קריירה מלאה בהפתעות, פיתולים ורגעים שהיו נקודת מפנה בכדורגל הישראלי ולעיתים אפילו העולמי. הספר מלא ברגעים עוצרי נשימה ובהם איך תיקל בפעם הראשונה את מסי ואיך הסתכל לרונאלדו בלבן של העיניים. לאורך הספר ייחשפו הקוראים גם לסודות ההצלחה הגדולים של בן חיים: הדיבור הפנימי והמשמעת העצמית שהובילו ליצירת חוסן מנטלי אדיר, התשוקה הגדולה למשחק, המשפחה התומכת. ואל תשכחו ש... הבלתי אפשרי הוא רק בראש שלנו!",
    imageUrl: "/lovable-uploads/eeb8194b-1c3e-4327-8b4e-bec2bc940160.png",
    purchaseUrl: "https://www.danibooks.co.il/%D7%A2%D7%99%D7%95%D7%9F/%D7%91%D7%99%D7%95%D7%92%D7%A8%D7%A4%D7%99%D7%95%D7%AA/%D7%91%D7%9B%D7%95%D7%97-%D7%94%D7%A8%D7%A6%D7%95%D7%9F-%D7%98%D7%9C-%D7%91%D7%9F-%D7%97%D7%99%D7%99%D7%9D",
    category: "אוטוביוגרפיה",
    rating: 5,
    price: "₪64"
  },
  {
    id: 2,
    title: "הרגלים אטומיים",
    author: "ג'יימס קליר",
    description: "איך נשבור הרגלים רעים ונטמיע הרגלים טובים? איך נתגבר על חוסר מוטיבציה וכוח רצון? איך נחזור למסלול לאחר שסטינו מהדרך? הנה הספר שיסייע לכם בכל אלו. כזה שמבוסס על מחקרים בביולוגיה, פסיכולוגיה ומדעי המוח.",
    imageUrl: "/lovable-uploads/5abaa65d-e95e-45df-8b1a-8442494689d3.png",
    purchaseUrl: "https://www.steimatzky.co.il/013621301",
    category: "התפתחות אישית",
    rating: 5,
    price: "₪95.20"
  },
  {
    id: 3,
    title: "הקול הפנימי",
    author: "איתן קרוס",
    description: "בספרו הקול הפנימי, הפסיכולוג איתן קרוס, חושף את כוחו הנסתר של הקול הפנימי שלנו ומראה איך ניתן לנצל אותו כדי לחיות חיים בריאים יותר, מספקים יותר ופרודוקטיביים יותר. קרוס חוקר את השיחות שמתנהלות בדממה בתוך ראשנו ומשלב ידע ממחקרים פורצי דרך בתחומי ההתנהגות והמוח. החדשות הטובות הן שעומדים לרשותנו הכלים הנחוצים כדי לגרום לקול הפנימי לשרת אותנו במקום להזיק לנו.",
    imageUrl: "/lovable-uploads/903c5436-85aa-4cd8-9a16-b182b2d59082.png",
    purchaseUrl: "https://www.danibooks.co.il/web/?pagetype=9&itemid=296446",
    category: "פסיכולוגיה",
    rating: 5,
    price: "₪64"
  },
  {
    id: 7,
    title: "כוחו של הרגל",
    author: "צ'רלס דוהיג",
    description: "נדמה לנו שרוב הבחירות הן תוצאה של החלטות שקולות, אבל האמת היא שהן תוצר של הרגלים. בספר הזה לוקח אותנו צ'רלס דוהיג להבנת המנגנונים מאחורי ההרגלים, איך אפשר לשנותם וליצור מהפך במפעלים, קהילות וחיינו שלנו.",
    imageUrl: "/lovable-uploads/588ce253-8b3c-4b72-8cd5-afdbec6685bd.png",
    purchaseUrl: "https://www.steimatzky.co.il/011373421",
    category: "התפתחות אישית",
    rating: 5,
    price: "₪78.40"
  },
  {
    id: 8,
    title: "GRIT",
    author: "אנג'לה דאקוורת",
    description: "בספר גריט, שהגיע בן לילה לרשימת רבי המכר של הניו יורק טיימס, מראה הפסיכולוגית פורצת הדרך אנג'לה דאקוורת לכל מי ששואף להצליח – הורים, תלמידים, מחנכים, ספורטאים ואנשי עסקים או בעצם כל אחד - שהסוד מאחורי הצלחות יוצאות דופן אינו הכישרון שאנו ניחנים בו אלא שילוב מיוחד של להט והתמדה שאותו היא מכנה \"גריט\".",
    imageUrl: "/lovable-uploads/fc3e00d8-a91a-4bc3-bef2-0fbe02a2c298.png",
    purchaseUrl: "https://www.danibooks.co.il/%D7%A2%D7%99%D7%95%D7%9F/%D7%A4%D7%A1%D7%99%D7%9B%D7%95%D7%9C%D7%95%D7%92%D7%99%D7%94-%D7%97%D7%99%D7%A0%D7%95%D7%9A/%D7%92%D7%A8%D7%99%D7%98-GRIT",
    category: "פסיכולוגיה",
    rating: 5,
    price: "₪59"
  },
  {
    id: 9,
    title: "דחיפות קלות",
    author: "קאס סאנסטיין וריצ'רד תיילר",
    description: "בכל יום אנחנו עומדים בפני אינספור בחירות ועלינו לקבל החלטה – מה לאכול, מה לקנות, כמה לחסוך, איפה להשקיע כסף, איך לשמור על הבריאות, מה לעשות כדי לשמור על הסביבה ועוד. הספר דחיפות קלות חושף בדרך משעשעת ומוחשית מאוד את הסיבות לבחירות הגרועות שלנו – ומראה מה ניתן לעשות כדי לשפר את בחירותינו.",
    imageUrl: "/lovable-uploads/28c4f376-4c2a-4c95-860d-febc4be278b2.png",
    purchaseUrl: "https://www.danibooks.co.il/%D7%A2%D7%99%D7%95%D7%9F/%D7%9B%D7%9C%D7%9B%D7%9C%D7%94-%D7%A9%D7%99%D7%95%D7%95%D7%A7-%D7%95%D7%A2%D7%A1%D7%A7%D7%99%D7%9D1/%D7%93%D7%97%D7%99%D7%A4%D7%95%D7%AA-%D7%A7%D7%9C%D7%95%D7%AA-Nudge",
    category: "קבלת החלטות",
    rating: 5,
    price: "₪69"
  }
];

export const MentalLibrary: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-center">הספרייה המנטאלית</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          רשימת ספרים מומלצים לפיתוח מיומנויות מנטליות וחוסן נפשי בספורט. הספרים נבחרו בקפידה כדי לסייע בפיתוח גישה מנטלית מנצחת.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedBooks.map((book) => (
          <Card key={book.id} className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{book.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">מאת: {book.author}</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary font-normal">
                  {book.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col space-y-4">
                <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-2">
                  {book.imageUrl.includes('/lovable-uploads/') ? (
                    <img 
                      src={book.imageUrl} 
                      alt={book.title} 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Book className="h-16 w-16" />
                      <span className="text-sm mt-2">תמונה לא זמינה</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 text-sm line-clamp-4">{book.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {Array.from({ length: book.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    {Array.from({ length: 5 - book.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gray-300" />
                    ))}
                    <span className="text-sm text-gray-500 mr-1">{book.rating}/5</span>
                  </div>
                  <span className="font-bold text-green-600">{book.price}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2 border-t">
              <Button 
                className="w-full gap-2 bg-green-600 hover:bg-green-700" 
                onClick={() => window.open(book.purchaseUrl, '_blank')}
              >
                <ShoppingCart className="h-4 w-4" />
                לרכישה
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
