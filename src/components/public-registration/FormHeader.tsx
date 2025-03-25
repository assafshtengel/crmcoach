
interface FormHeaderProps {
  coachName: string | undefined;
  customMessage: string | undefined;
}

export const FormHeader = ({ coachName, customMessage }: FormHeaderProps) => {
  return (
    <div className="py-4 px-4 sm:px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <h1 className="text-lg sm:text-xl font-semibold">
        רישום למפגשים מנטאליים עם {coachName}
      </h1>
      {customMessage && (
        <p className="mt-1 text-sm text-white/90">{customMessage}</p>
      )}
    </div>
  );
};
