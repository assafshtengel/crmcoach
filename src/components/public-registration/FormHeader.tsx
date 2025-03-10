
interface FormHeaderProps {
  coachName: string | undefined;
  customMessage: string | undefined;
}

export const FormHeader = ({ coachName, customMessage }: FormHeaderProps) => {
  return (
    <div className="py-6 px-4 sm:px-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <h1 className="text-xl sm:text-2xl font-semibold">
        רישום לאימון עם {coachName || "המאמן"}
      </h1>
      {customMessage && (
        <p className="mt-2 text-white/90">{customMessage}</p>
      )}
    </div>
  );
};
