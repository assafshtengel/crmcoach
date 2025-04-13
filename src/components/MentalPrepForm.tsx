import React from 'react';

interface MentalPrepFormProps {
  onFormSubmitted?: () => void;
}

export const MentalPrepForm: React.FC<MentalPrepFormProps> = ({ onFormSubmitted }) => {
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [question3, setQuestion3] = useState('');
  const [question4, setQuestion4] = useState('');
  const [question5, setQuestion5] = useState('');
  const [question6, setQuestion6] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר מחדש",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('mental_prep_responses')
        .insert([
          {
            user_id: user.id,
            question1,
            question2,
            question3,
            question4,
            question5,
            question6,
          },
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "התשובות נשמרו בהצלחה",
        description: "תודה על השיתוף",
      });
      
      navigate("/dashboard-coach");

      // Call the callback if provided
      if (onFormSubmitted) {
        onFormSubmitted();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התשובות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">מוכנות מנטלית לפני משחק</CardTitle>
        <CardDescription>ענה על השאלות הבאות כדי להכין את עצמך מנטלית</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question1">מהן המחשבות העיקריות שלך לפני המשחק?</Label>
            <Textarea
              id="question1"
              placeholder="תשובה"
              value={question1}
              onChange={(e) => setQuestion1(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="question2">אילו תרחישים חיוביים דמיינת כהכנה?</Label>
            <Textarea
              id="question2"
              placeholder="תשובה"
              value={question2}
              onChange={(e) => setQuestion2(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="question3">מה אתה עושה כדי להרגיע את עצמך?</Label>
            <Textarea
              id="question3"
              placeholder="תשובה"
              value={question3}
              onChange={(e) => setQuestion3(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="question4">מוכנות פיזית (1-10)</Label>
            <Input
              type="number"
              id="question4"
              placeholder="1-10"
              value={question4}
              onChange={(e) => setQuestion4(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="question5">מוכנות מנטלית (1-10)</Label>
            <Input
              type="number"
              id="question5"
              placeholder="1-10"
              value={question5}
              onChange={(e) => setQuestion5(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="question6">רמת הלחץ (1-10)</Label>
            <Input
              type="number"
              id="question6"
              placeholder="1-10"
              value={question6}
              onChange={(e) => setQuestion6(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "שומר..." : "שלח"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
