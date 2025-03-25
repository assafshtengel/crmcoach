import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, Award, Star } from "lucide-react";
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
}
const recommendedBooks: Book[] = [{
  id: 1,
  title: "המיינד של האלוף",
  author: "ג'ים אפלמאט",
  description: "כיצד אלופים חושבים, מתאמנים ומנצחים - ספר מוביל בתחום הפסיכולוגיה של הספורט שמציג גישות מנטליות של אלופים.",
  imageUrl: "https://via.placeholder.com/150",
  purchaseUrl: "https://www.booknet.co.il/",
  category: "ביצועי שיא",
  rating: 5
}, {
  id: 2,
  title: "הזור המנטלי",
  author: "ד״ר בוב רוטלה",
  description: "מדריך פרקטי לשליטה מנטלית והתמודדות עם לחץ בספורט התחרותי.",
  imageUrl: "https://via.placeholder.com/150",
  purchaseUrl: "https://www.steimatzky.co.il/",
  category: "התמודדות עם לחץ",
  rating: 4
}, {
  id: 3,
  title: "פסיכולוגיה של הישגיות",
  author: "קרול דווק",
  description: "על מיינדסט מקדם צמיחה ומיינדסט מקובע וכיצד הם משפיעים על הישגים אתלטיים ואחרים.",
  imageUrl: "https://via.placeholder.com/150",
  purchaseUrl: "https://www.bookdepository.com/",
  category: "תפיסה מנטלית",
  rating: 5
}, {
  id: 4,
  title: "הדרך לניצחון",
  author: "טים גרובר",
  description: "מדריך מקיף לאתלטים ומאמנים על פיתוח חוסן נפשי ומיומנויות התמודדות.",
  imageUrl: "https://via.placeholder.com/150",
  purchaseUrl: "https://www.amazon.com/",
  category: "חוסן נפשי",
  rating: 4
}, {
  id: 5,
  title: "בזרם התודעה",
  author: "מיהאי צ׳יקסנטמיהאי",
  description: "על מצב הזרימה וכיצד להגיע אליו בספורט, הספר מסביר את מצב התודעה האופטימלי לביצועים.",
  imageUrl: "https://via.placeholder.com/150",
  purchaseUrl: "https://simania.co.il/",
  category: "מצבי זרימה",
  rating: 5
}, {
  id: 6,
  title: "אתלטים וחרדת ביצוע",
  author: "ד״ר שרון הדר",
  description: "טכניקות מתקדמות להתמודדות עם חרדת ביצוע בספורט תחרותי.",
  imageUrl: "https://via.placeholder.com/150",
  purchaseUrl: "https://www.booknet.co.il/",
  category: "התמודדות עם לחץ",
  rating: 4
}];
export const MentalLibrary: React.FC = () => {
  return <div className="container py-8">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-center">מחקרים אחרונים באימון המנטאלי </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">בדף זה נפרסם את כל המחקרים האחרונים בעולם המנטאלי שהתפרסו</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedBooks.map(book => <Card key={book.id} className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
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
                <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-2">
                  <BookOpen className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-gray-700 text-sm">{book.description}</p>
                <div className="flex items-center">
                  {Array.from({
                length: book.rating
              }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  {Array.from({
                length: 5 - book.rating
              }).map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                  <span className="text-sm text-gray-500 mr-1">{book.rating}/5</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2 border-t">
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => window.open(book.purchaseUrl, '_blank')}>
                <ShoppingCart className="h-4 w-4" />
                לרכישה
              </Button>
            </CardFooter>
          </Card>)}
      </div>
    </div>;
};