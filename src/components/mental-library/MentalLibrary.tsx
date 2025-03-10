
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
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
    imageUrl: "public/lovable-uploads/eeb8194b-1c3e-4327-8b4e-bec2bc940160.png",
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
    imageUrl: "public/lovable-uploads/5abaa65d-e95e-45df-8b1a-8442494689d3.png",
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
    imageUrl: "public/lovable-uploads/903c5436-85aa-4cd8-9a16-b182b2d59082.png",
    purchaseUrl: "https://www.danibooks.co.il/web/?pagetype=9&itemid=296446",
    category: "פסיכולוגיה",
    rating: 5,
    price: "₪64"
  },
  {
    id: 4,
    title: "המיינד של האלוף",
    author: "ג'ים אפלמאט",
    description: "כיצד אלופים חושבים, מתאמנים ומנצחים - ספר מוביל בתחום הפסיכולוגיה של הספורט שמציג גישות מנטליות של אלופים.",
    imageUrl: "https://via.placeholder.com/150",
    purchaseUrl: "https://www.booknet.co.il/",
    category: "ביצועי שיא",
    rating: 5,
    price: "₪75"
  },
  {
    id: 5,
    title: "הזור המנטלי",
    author: "ד״ר בוב רוטלה",
    description: "מדריך פרקטי לשליטה מנטלית והתמודדות עם לחץ בספורט התחרותי.",
    imageUrl: "https://via.placeholder.com/150",
    purchaseUrl: "https://www.steimatzky.co.il/",
    category: "התמודדות עם לחץ",
    rating: 4,
    price: "₪85"
  },
  {
    id: 6,
    title: "פסיכולוגיה של הישגיות",
    author: "קרול דווק",
    description: "על מיינדסט מקדם צמיחה ומיינדסט מקובע וכיצד הם משפיעים על הישגים אתלטיים ואחרים.",
    imageUrl: "https://via.placeholder.com/150",
    purchaseUrl: "https://www.bookdepository.com/",
    category: "תפיסה מנטלית",
    rating: 5,
    price: "₪70"
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
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="h-16 w-16 text-gray-400"
                    />
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
