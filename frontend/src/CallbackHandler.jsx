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

        if (token) {
            try {
                // Decode token to get user info (without verification - backend already verified it)
                const decoded = jwtDecode(token);

                const userInfo = {
                    sub: decoded.sub,
                    email: decoded.email || '',
                    name: decoded.name || '',
                    picture: decoded.picture || ''
                };

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
