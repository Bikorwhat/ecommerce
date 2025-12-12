import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

const CallbackHandler = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const sub = searchParams.get('sub');

        console.log('Callback received:', { token: !!token, email, name, sub });

        if (token) {
            try {
                const userInfo = {
                    sub: sub || '',
                    email: email || '',
                    name: name || 'User',
                    picture: ''
                };

                console.log('Storing user info:', userInfo);

                // Store token and user info
                login(token, userInfo);

                // Redirect to home page
                navigate('/');
            } catch (error) {
                console.error('Error processing auth callback:', error);
                navigate('/');
            }
        } else {
            // No token in URL, redirect to home
            navigate('/');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Completing login...</h2>
                <p className="text-gray-600">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default CallbackHandler;
