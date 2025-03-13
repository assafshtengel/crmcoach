
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, GraduationCap, FileText, Clock, User, Tag, BookText, FileBarChart, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const researchArticles = [
  {
    id: 1,
    title: 'פסיכולוגיית הספורט והשפעת אימון מנטלי על ספורטאים צעירים',
    author: 'Pediatric Exercise Science',
    date: '2024-09-01',
    category: 'פסיכולוגיה של הספורט',
    readTime: 12,
    summary: 'מחקר אקדמי עדכני שבחן את ההשפעה של תוכנית אימון מנטלי קצרה על דימוי העצמי וביצועי ספורטאים צעירים. במחקר השתתפו 45 נערים ונערות (שחיינים ושחקני כדורעף) שחולקו לקבוצת התערבות ולקבוצת ביקורת. תוצאות המחקר הראו שיפור משמעותי במדדים ספציפיים של הערכה עצמית בקרב הצעירים שקיבלו את האימון – כגון תחושת המסוגלות הגופנית, הכושר הכללי, החוסן הפיזי ודימוי הגוף.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/39265974/#:~:text=Results%3A%20%20The%20intervention%20group,attractiveness%20but%20not%20general%20SE',
    icon: <Brain className="h-5 w-5 mr-1" />,
  },
  {
    id: 2,
    title: 'טכניקות מנטליות לשיפור ביצועי ספורטאים',
    author: 'ד"ר איריס אורבך, מכון וינגייט',
    date: '2024-08-15',
    category: 'טכניקות מנטליות',
    readTime: 15,
    summary: 'מאמר מקצועי המדגיש כי הכנה מנטלית היא מרכיב חיוני להישגי שיא של ספורטאים, ויש לשלב אותה בשגרת האימונים היום-יומית. טכניקות מנטליות נפוצות כוללות דמיון מודרך, הצבת מטרות, תרגול מיינדפולנס, ניהול נשימה ודיבור עצמי חיובי. מטא-אנליזה שפורסמה במאי 2024 הראתה שאימוני מיינדפולנס מביאים לשיפור ניכר בריכוז, מפחיתים חרדת ביצוע, ומשפרים הישגים.',
    link: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1375608/full#:~:text=reached%20the%20level%20of%20large,effect%20size',
    icon: <BookText className="h-5 w-5 mr-1" />,
  },
  {
    id: 3,
    title: 'השפעת הכנה מנטלית על רצים',
    author: 'Frontiers in Sports and Active Living',
    date: '2024-11-10',
    category: 'הכנה מנטלית',
    readTime: 10,
    summary: 'מחקר חדש בדק רצים למרחקים ארוכים מבחינת רמת ההכנה המנטלית שלהם, והשווה בין רצים שקיבלו הדרכה פסיכולוגית לבין כאלה שלא. התוצאות הראו כי רצים שעברו אימון מנטלי הפגינו יכולות מנטליות גבוהות יותר בהיבטים רבים – כגון ריכוז, התמודדות עם לחצי תחרות, ושימוש בכלים מנטליים. נשים דיווחו על שימוש תכוף יותר בטכניקת דיבור עצמי חיובי יחסית לגברים.',
    link: 'https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1456504/full#:~:text=Results%3A%20The%20results%20indicated%20that,the%20overall%20mental%20preparedness%20score',
    icon: <FileBarChart className="h-5 w-5 mr-1" />,
  },
  {
    id: 4,
    title: 'יעילות קורס אימון מנטלי לספורטאים',
    author: 'Journal of Athletic Training',
    date: '2024-07-22',
    category: 'אימון מנטלי',
    readTime: 14,
    summary: 'מחקר יישומי שהעריך תוכנית אימון מנטלי קצרה (6 מפגשים) בקרב 54 ספורטאיות קולג\'. הממצאים הצביעו על שיפור פסיכולוגי משמעותי: עלייה בציון חוסן מנטלי ובכישורי התמודדות. במעקב כעבור 4 חודשים, יכולת ההתמודדות נשארה גבוהה באופן מובהק. המשתתפות הביעו שביעות רצון גבוהה מהקורס וציינו השפעה חיובית של התכנים על יכולתן המנטלית בתחרויות.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/38014800/#:~:text=Conclusions%3A%20%20Mental%20toughness%20and,and%20reported%20overall%20positive%20experiences',
    icon: <BookOpen className="h-5 w-5 mr-1" />,
  },
  {
    id: 5,
    title: 'השפעת אימון מנטאלי על ביצועי ספורטאים צעירים',
    author: 'ד"ר רון כהן',
    date: '2023-05-15',
    category: 'פסיכולוגיה של הספורט',
    readTime: 8,
    summary: 'מחקר זה בוחן את ההשפעה של תוכניות אימון מנטאלי על ביצועים של ספורטאים בגילאי 12-18. התוצאות מראות שיפור משמעותי ביכולת התמודדות עם לחץ ושיפור בביצועים תחרותיים לאחר 8 שבועות של אימון שיטתי.',
  },
  {
    id: 6,
    title: 'טכניקות דמיון מודרך לשיפור ביצועים אתלטיים',
    author: 'פרופ\' שירה לוי',
    date: '2023-03-10',
    category: 'דמיון מודרך',
    readTime: 12,
    summary: 'המחקר מציג שיטות מתקדמות לשימוש בדמיון מודרך כחלק מתוכנית האימון השוטפת. המחקר עקב אחרי 45 ספורטאים אולימפיים שהשתמשו בטכניקות אלו לאורך עונת התחרויות, והדגים שיפור ניכר במדדי ביצוע ספציפיים.',
  },
  {
    id: 7,
    title: 'שילוב שיטות CBT באימון ספורטאים תחרותיים',
    author: 'ד"ר נועם אברהמי',
    date: '2023-07-22',
    category: 'טיפול קוגניטיבי-התנהגותי',
    readTime: 15,
    summary: 'המאמר סוקר את היישום של טכניקות טיפול קוגניטיבי-התנהגותי (CBT) בהקשר של אימון מנטאלי בספורט. המחקר מציג מודל עבודה מובנה המאפשר למאמנים לשלב אלמנטים של CBT בתוכנית האימון הרגילה, ומדגים תוצאות חיוביות בהפחתת חרדת ביצוע.',
  },
  {
    id: 8,
    title: 'הקשר בין מיינדפולנס וביצועים ספורטיביים בגיל ההתבגרות',
    author: 'ד"ר מיכל שטרן',
    date: '2023-02-05',
    category: 'מיינדפולנס',
    readTime: 10,
    summary: 'מחקר חדשני שבחן את ההשפעה של תרגול מיינדפולנס יומי על ספורטאים מתבגרים. המחקר מצא שיפור משמעותי ביכולת הריכוז, ניהול רגשות, והתמודדות עם כישלונות בקרב המשתתפים שתרגלו מיינדפולנס באופן קבוע.',
  },
  {
    id: 9,
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
  link?: string;
  icon?: React.ReactNode;
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
        <div className="flex gap-2">
          {article.link && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => window.open(article.link, '_blank')}>
              לקריאת המאמר
            </Button>
          )}
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
            {article.icon || <FileText className="h-4 w-4 mr-1" />}
            מאמר מחקרי
          </Badge>
        </div>
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
          <TabsTrigger value="techniques">טכניקות מנטליות</TabsTrigger>
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
                .filter(article => 
                  ['פסיכולוגיה של הספורט', 'הכנה מנטלית', 'אימון מנטלי'].includes(article.category)
                )
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
                  ['דמיון מודרך', 'מיינדפולנס', 'טיפול קוגניטיבי-התנהגותי', 'טכניקות מנטליות'].includes(article.category)
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
                .filter(article => 
                  // Show newest articles from 2024
                  article.date.startsWith('2024')
                )
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
