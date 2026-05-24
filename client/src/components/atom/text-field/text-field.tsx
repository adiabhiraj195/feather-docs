import './textField.css';

interface TextFieldProps {
    value: string;
    onInput: Function;
    type: 'text' | 'password' | 'email';
    placeholder?: string;
    ref?: any;
    focus?: boolean;
}

const TextField = ({
    value,
    onInput,
    type,
    placeholder,
    ref,
    focus,
}: TextFieldProps) => {
    return (
        <div className='input-wrap'>
            <input
                type={type}
                value={value}
                className='register-input'
                placeholder={placeholder}
                onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
                ref={ref}
                autoFocus={focus}
            />
        </div>
    )
}

export default TextField;
