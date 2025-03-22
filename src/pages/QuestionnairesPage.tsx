
import React, { useState } from 'react';
import { QuestionnairesList } from '@/components/questionnaires/QuestionnairesList';
import { QuestionnaireViewer } from '@/components/questionnaires/QuestionnaireViewer';
import type { Questionnaire, PlayerQuestionnaireResponse } from '@/types/questionnaire';

// Mock data for demonstration purposes
const mockQuestionnaires: Questionnaire[] = [
  {
    id: '1',
    title: 'שאלון מוטיבציה שבועי',
    description: 'שאלון זה נועד לבדוק את רמת המוטיבציה והמחויבות של השחקן במהלך השבוע האחרון.',
    questions: [
      {
        id: 'q1',
        text: 'כיצד היית מדרג את רמת המוטיבציה שלך השבוע?',
        type: 'closed',
        options: [
          { id: 'o1', text: 'נמוכה מאוד', value: 1 },
          { id: 'o2', text: 'נמוכה', value: 2 },
          { id: 'o3', text: 'בינונית', value: 3 },
          { id: 'o4', text: 'גבוהה', value: 4 },
          { id: 'o5', text: 'גבוהה מאוד', value: 5 }
        ],
        required: true
      },
      {
        id: 'q2',
        text: 'מה היו האתגרים העיקריים שלך השבוע?',
        type: 'open',
        required: true
      },
      {
        id: 'q3',
        text: 'האם הצלחת להשיג את היעדים השבועיים שהצבת לעצמך?',
        type: 'closed',
        options: [
          { id: 'o1', text: 'לא', value: 1 },
          { id: 'o2', text: 'חלקית', value: 2 },
          { id: 'o3', text: 'כן', value: 3 }
        ],
        required: true
      }
    ],
    createdAt: '2023-08-10T12:00:00Z',
    updatedAt: '2023-08-15T14:30:00Z',
    isActive: true
  },
  {
    id: '2',
    title: 'הערכת ביצועים במשחק האחרון',
    description: 'שאלון זה נועד להעריך את הביצועים שלך במשחק האחרון ולזהות תחומים לשיפור.',
    questions: [
      {
        id: 'q1',
        text: 'כיצד היית מדרג את הביצועים שלך במשחק האחרון?',
        type: 'closed',
        options: [
          { id: 'o1', text: 'חלשים מאוד', value: 1 },
          { id: 'o2', text: 'חלשים', value: 2 },
          { id: 'o3', text: 'בינוניים', value: 3 },
          { id: 'o4', text: 'טובים', value: 4 },
          { id: 'o5', text: 'מצוינים', value: 5 }
        ],
        required: true
      },
      {
        id: 'q2',
        text: 'מה היו החוזקות העיקריות שלך במשחק?',
        type: 'open',
        required: true
      },
      {
        id: 'q3',
        text: 'באילו תחומים אתה מרגיש שאתה צריך להשתפר?',
        type: 'open',
        required: true
      }
    ],
    createdAt: '2023-08-20T12:00:00Z',
    updatedAt: '2023-08-22T10:15:00Z',
    isActive: true
  }
];

const mockResponses: PlayerQuestionnaireResponse[] = [
  {
    id: 'r1',
    playerId: 'p1',
    playerName: 'יוסי כהן',
    questionnaireId: '1',
    responses: [
      {
        questionId: 'q1',
        answer: 4,
        answeredAt: '2023-08-16T09:30:00Z'
      },
      {
        questionId: 'q2',
        answer: 'התמודדתי עם עייפות רבה השבוע בגלל לימודים ואימונים מוגברים, אבל הצלחתי לשמור על מחויבות לאימונים.',
        answeredAt: '2023-08-16T09:32:00Z'
      },
      {
        questionId: 'q3',
        answer: 2,
        answeredAt: '2023-08-16T09:35:00Z'
      }
    ],
    submittedAt: '2023-08-16T09:35:00Z'
  },
  {
    id: 'r2',
    playerId: 'p2',
    playerName: 'דני לוי',
    questionnaireId: '2',
    responses: [
      {
        questionId: 'q1',
        answer: 3,
        answeredAt: '2023-08-23T14:20:00Z'
      },
      {
        questionId: 'q2',
        answer: 'הייתי טוב מאוד בהגנה ובקריאת המשחק. הצלחתי לעצור כמה התקפות משמעותיות.',
        answeredAt: '2023-08-23T14:22:00Z'
      },
      {
        questionId: 'q3',
        answer: 'צריך לשפר את הדיוק במסירות ארוכות וכן את היכולת האירובית שלי בדקות האחרונות של המשחק.',
        answeredAt: '2023-08-23T14:25:00Z'
      }
    ],
    submittedAt: '2023-08-23T14:25:00Z'
  }
];

const QuestionnairesPage = () => {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [response, setResponse] = useState<PlayerQuestionnaireResponse | null>(null);

  const handleSelectQuestionnaire = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    
    // Find a response for this questionnaire in our mock data
    const matchingResponse = mockResponses.find(r => r.questionnaireId === questionnaire.id);
    setResponse(matchingResponse || null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">ניהול שאלונים</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuestionnairesList 
          questionnaires={mockQuestionnaires}
          onSelectQuestionnaire={handleSelectQuestionnaire}
          selectedQuestionnaireId={selectedQuestionnaire?.id}
        />
        
        {selectedQuestionnaire && response ? (
          <QuestionnaireViewer 
            questionnaire={selectedQuestionnaire}
            response={response}
          />
        ) : (
          <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">בחר שאלון מהרשימה כדי לצפות בתשובות</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnairesPage;
