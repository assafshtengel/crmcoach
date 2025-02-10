
import { MentalPrepForm } from "@/components/MentalPrepForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-sage-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">הכנה מנטלית למשחק</h1>
        <p className="text-gray-600 text-center mb-8">
          מלא את הטופס הבא כדי להתכונן למשחק מבחינה מנטלית. 
          התהליך יעזור לך להתמקד, להישאר רגוע ולהתמודד עם לחץ ביעילות.
        </p>
        <MentalPrepForm />
      </div>
    </div>
  );
};

export default Index;
