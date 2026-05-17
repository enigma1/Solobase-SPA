type FormFieldWrapperProps = {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
};

export const FormFieldWrapper = ({
  label,
  error,
  htmlFor,
  children,
}: FormFieldWrapperProps) => {
  return (
    <div className='field'>
      <label
        htmlFor={htmlFor}
        className={`text-sm ${error ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label}
      </label>
      {children}
    </div>
  );
};
