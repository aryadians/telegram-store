export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src="/logostore.png" 
            alt="Zona Akun Premium" 
            className={`rounded-xl object-cover ${props.className}`} 
        />
    );
}
