interface InputProps {
    label: string;
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
  }
  
  const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    error,
    disabled,
    placeholder,
    className = '',
  }) => (
    <div className="mb-4">
      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-transparent border border-gray-500 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
          error ? 'border-red-500' : 'border-gray-500'
        } ${disabled ? 'bg-gray-700 cursor-not-allowed opacity-50' : ''} ${className}`}
        placeholder={placeholder || label}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
  
  export default Input;