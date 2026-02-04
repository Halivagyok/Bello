import { useState } from 'react';
import { useStore } from '../store';


interface textinput {text: string, setValue : any}

const TextInput = ({text, setValue}: textinput) => {
    
    
    let type: string = ""
    if(text === "Email") type = "email"
    else if(text === "Password") type = "password"
    else type = "text"

    const changeValue = () => {
        let val = document.getElementById(text).value
        setValue(val)
    }

    return(
        <div className="">
            <div className="mx-auto w-fit rounded-lg bg-t2 text-xl text-t4 px-4 py-1 relative top-[10px] ">{text}</div>
            <input id={text} className={`p-2 border-3 border-t1 w-full rounded-lg`} type={type} onChange={() => changeValue()} required />
        </div>
    )
}

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const login = useStore((state) => state.login);
    const signup = useStore((state) => state.signup);

    const sendData = async () => {
        try {
            if (isLogin) await login(email, password);
            else await signup(email, password, name);
        } 
        catch (err: any) {
            setError(err.message || 'Authentication failed');
        }
    };

    return (
        <div className="h-screen flex justify-center items-center ">    
            <div className="w-100 mx-10">
                <div className=' text-6xl text-center text-t2'>Bello</div>
                <div className="flex justify-between py-4">    
                    <input className={`text-center justify-center p-2 w-full ${isLogin ? "border-b-4 border-t3 " : ""}`} onClick={() => setIsLogin(true)} type="button" value="Login" />
                    <input className={`text-center justify-center p-2 w-full ${isLogin ? " " : "border-b-4 border-t3"}`} onClick={() => setIsLogin(false)} type="button" value="Sign Up" />           
                </div>
                <div className="flex flex-col">
                    {isLogin ? "" : <TextInput text={"Name"} setValue={setName}/>} 
                    <TextInput text={"Email"} setValue={setEmail}/>    
                    <TextInput text={"Password"} setValue={setPassword}/>    
                    <input className='mx-auto w-full rounded-lg py-2 my-8 bg-t2 text-xl text-t4' type="button" value={isLogin ? "Login" : "Sign Up"} onClick={() => sendData()}/>
                </div>
            </div>
        </div>
    );
}
