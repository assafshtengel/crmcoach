
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, GraduationCap, FileText, Clock, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const researchArticles = [
  {
    id: 1,
    title: 'השפעת אימון מנטאלי על ביצועי ספורטאים צעירים',
    author: 'ד"ר רון כהן',
    date: '2023-05-15',
    category: 'פסיכולוגיה של הספורט',
    readTime: 8,
    summary: 'מחקר זה בוחן את ההשפעה של תוכניות אימון מנטאלי על ביצועים של ספורטאים בגילאי 12-18. התוצאות מראות שיפור משמעותי ביכולת התמודדות עם לחץ ושיפור בביצועים תחרותיים לאחר 8 שבועות של אימון שיטתי.',
  },
  {
    id: 2,
    title: 'טכניקות דמיון מודרך לשיפור ביצועים אתלטיים',
    author: 'פרופ\' שירה לוי',
    date: '2023-03-10',
    category: 'דמיון מודרך',
    readTime: 12,
    summary: 'המחקר מציג שיטות מתקדמות לשימוש בדמיון מודרך כחלק מתוכנית האימון השוטפת. המחקר עקב אחרי 45 ספורטאים אולימפיים שהשתמשו בטכניקות אלו לאורך עונת התחרויות, והדגים שיפור ניכר במדדי ביצוע ספציפיים.',
  },
  {
    id: 3,
    title: 'שילוב שיטות CBT באימון ספורטאים תחרותיים',
    author: 'ד"ר נועם אברהמי',
    date: '2023-07-22',
    category: 'טיפול קוגניטיבי-התנהגותי',
    readTime: 15,
    summary: 'המאמר סוקר את היישום של טכניקות טיפול קוגניטיבי-התנהגותי (CBT) בהקשר של אימון מנטאלי בספורט. המחקר מציג מודל עבודה מובנה המאפשר למאמנים לשלב אלמנטים של CBT בתוכנית האימון הרגילה, ומדגים תוצאות חיוביות בהפחתת חרדת ביצוע.',
  },
  {
    id: 4,
    title: 'הקשר בין מיינדפולנס וביצועים ספורטיביים בגיל ההתבגרות',
    author: 'ד"ר מיכל שטרן',
    date: '2023-02-05',
    category: 'מיינדפולנס',
    readTime: 10,
    summary: 'מחקר חדשני שבחן את ההשפעה של תרגול מיינדפולנס יומי על ספורטאים מתבגרים. המחקר מצא שיפור משמעותי ביכולת הריכוז, ניהול רגשות, והתמודדות עם כישלונות בקרב המשתתפים שתרגלו מיינדפולנס באופן קבוע.',
  },
  {
    id: 5,
    title: 'אסטרטגיות לבניית חוסן מנטאלי בספורטאים צעירים',
    author: 'פרופ\' דוד הלוי',
    date: '2023-06-18',
    category: 'חוסן מנטאלי',
    readTime: 14,
    summary: 'המחקר מציג מסגרת עבודה יישומית לפיתוח חוסן מנטאלי בקרב ספורטאים צעירים, עם דגש על התמודדות עם כישלונות, התאוששות מפציעות, ויכולת להתמודד עם לחץ תחרותי. המחקר מציג תוכנית התערבות בת 12 שבועות שהביאה לשיפור משמעותי במדדי החוסן המנטאלי.',
  }
];

interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
  summary: string;
}

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary">{article.title}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <User className="h-4 w-4 mr-1" />
          <span className="mr-4">{article.author}</span>
          <Tag className="h-4 w-4 mr-1" />
          <span>{article.category}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{article.summary}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{article.readTime} דקות קריאה</span>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
          מאמר מחקרי
        </Badge>
      </CardFooter>
    </Card>
  );
};

const EducationalTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-primary">הכרטיסייה החינוכית</h2>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">כל המאמרים</TabsTrigger>
          <TabsTrigger value="psychology">פסיכולוגיה של הספורט</TabsTrigger>
          <TabsTrigger value="techniques">טכניקות מנטאליות</TabsTrigger>
          <TabsTrigger value="research">מחקרים חדשים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {researchArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="psychology" className="mt-0">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {researchArticles
                .filter(article => article.category === 'פסיכולוגיה של הספורט')
                .map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              }
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="techniques" className="mt-0">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {researchArticles
                .filter(article => 
                  ['דמיון מודרך', 'מיינדפולנס', 'טיפול קוגניטיבי-התנהגותי'].includes(article.category)
                )
                .map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              }
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="research" className="mt-0">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {researchArticles
                .filter(article => article.category === 'חוסן מנטאלי')
                .map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))
              }
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationalTab;
