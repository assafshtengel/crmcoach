
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Home, Pencil } from 'lucide-react';
import { usePlayers } from '@/contexts/PlayersContext';
import { toast } from 'sonner';
import type { Coach } from '@/contexts/PlayersContext';

interface EditableField {
  name: keyof Coach;
  isEditing: boolean;
}

const ProfileCoach = () => {
  const navigate = useNavigate();
  const { coach, updateCoach } = usePlayers();
  const [editableFields, setEditableFields] = useState<EditableField[]>([
    { name: 'fullName', isEditing: false },
    { name: 'email', isEditing: false },
    { name: 'phone', isEditing: false },
    { name: 'description', isEditing: false },
  ]);
  const [tempValues, setTempValues] = useState<Coach>(coach);

  const startEditing = (fieldName: keyof Coach) => {
    setEditableFields(prev =>
      prev.map(field =>
        field.name === fieldName
          ? { ...field, isEditing: true }
          : field
      )
    );
  };

  const handleSave = (fieldName: keyof Coach) => {
    updateCoach({ [fieldName]: tempValues[fieldName] });
    setEditableFields(prev =>
      prev.map(field =>
        field.name === fieldName
          ? { ...field, isEditing: false }
          : field
      )
    );
    toast.success('הפרטים עודכנו בהצלחה!');
  };

  const handleCancel = (fieldName: keyof Coach) => {
    setTempValues(prev => ({ ...prev, [fieldName]: coach[fieldName] }));
    setEditableFields(prev =>
      prev.map(field =>
        field.name === fieldName
          ? { ...field, isEditing: false }
          : field
      )
    );
  };

  const handleChange = (fieldName: keyof Coach, value: string) => {
    setTempValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const renderField = (fieldName: keyof Coach, label: string, type: string = 'text') => {
    const isEditing = editableFields.find(f => f.name === fieldName)?.isEditing;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor={fieldName}>{label}</Label>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startEditing(fieldName)}
              className="h-8 px-2"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {fieldName === 'description' ? (
          <Textarea
            id={fieldName}
            value={isEditing ? tempValues[fieldName] : coach[fieldName]}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            disabled={!isEditing}
            placeholder={`הכנס ${label}`}
            className="resize-none"
            dir="rtl"
          />
        ) : (
          <Input
            id={fieldName}
            type={type}
            value={isEditing ? tempValues[fieldName] : coach[fieldName]}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            disabled={!isEditing}
            placeholder={`הכנס ${label}`}
            dir={type === 'email' || type === 'tel' ? 'ltr' : 'rtl'}
          />
        )}
        {isEditing && (
          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancel(fieldName)}
            >
              ביטול
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(fieldName)}
            >
              שמור
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">פרופיל מאמן</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזרה לדף הראשי"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {renderField('fullName', 'שם מלא')}
          {renderField('email', 'אימייל', 'email')}
          {renderField('phone', 'טלפון', 'tel')}
          {renderField('description', 'תיאור')}
        </div>
      </div>
    </div>
  );
};

export default ProfileCoach;
