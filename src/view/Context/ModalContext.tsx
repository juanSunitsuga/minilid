import React, { createContext, useState, useContext } from 'react';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';

interface ModalContextType {
    // Modal open states
    isLoginModalOpen: boolean;
    isRegisterModalOpen: boolean;
    isForgotPasswordModalOpen: boolean;

    // Prefill data for modals
    loginPrefillData: {
        email?: string;
        userType?: 'applier' | 'recruiter' | 'company';
    };

    // Open modals
    openLoginModal: (prefillData?: any) => void;
    openRegisterModal: () => void;
    openForgotPasswordModal: () => void;

    // Close modals
    closeLoginModal: () => void;
    closeRegisterModal: () => void;
    closeForgotPasswordModal: () => void;

    // Switch between modals
    switchToLogin: (prefillData?: any) => void;
    switchToRegister: () => void;
    switchToForgotPassword: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Modal open states
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

    // Prefill data for modals
    const [loginPrefillData, setLoginPrefillData] = useState<{
        email?: string;
        userType?: 'applier' | 'recruiter' | 'company';
    }>({});

    // Open modals
    const openLoginModal = (initialData?: { email?: string, userType?: 'applier' | 'recruiter' | 'company' }) => {
        // Check if we have a lastRegisteredEmail in localStorage
        const lastRegisteredEmail = localStorage.getItem('lastRegisteredEmail');
        
        // If available, use it and then remove it
        if (lastRegisteredEmail && (!initialData || !initialData.email)) {
            initialData = {
                ...initialData,
                email: lastRegisteredEmail
            };
            localStorage.removeItem('lastRegisteredEmail');
        }
        
        setLoginPrefillData(initialData || {});
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
        setIsForgotPasswordModalOpen(false);
    };

    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
        setIsForgotPasswordModalOpen(false);
    };

    const openForgotPasswordModal = () => {
        setIsForgotPasswordModalOpen(true);
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
    };

    // Close modals
    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
        setLoginPrefillData({});
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false);
    };

    const closeForgotPasswordModal = () => {
        setIsForgotPasswordModalOpen(false);
    };

    // Switch between modals
    const switchToLogin = (prefillData?: any) => {
        if (prefillData) {
            setLoginPrefillData(prefillData);
        }

        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
        setIsForgotPasswordModalOpen(false);
    };

    const switchToRegister = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
        setIsForgotPasswordModalOpen(false);
    };

    const switchToForgotPassword = () => {
        setIsForgotPasswordModalOpen(true);
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
    };

    return (
        <ModalContext.Provider
            value={{
                isLoginModalOpen,
                isRegisterModalOpen,
                isForgotPasswordModalOpen,
                loginPrefillData,
                openLoginModal,
                openRegisterModal,
                openForgotPasswordModal,
                closeLoginModal,
                closeRegisterModal,
                closeForgotPasswordModal,
                switchToLogin,
                switchToRegister,
                switchToForgotPassword,
            }}
        >
            {children}
            <ModalContainer />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

// This component renders the modals based on context state
const ModalContainer: React.FC = () => {
    const {
        isLoginModalOpen,
        isRegisterModalOpen,
        isForgotPasswordModalOpen,
        loginPrefillData,
        closeLoginModal,
        closeRegisterModal,
        closeForgotPasswordModal,
        switchToLogin,
        switchToRegister
    } = useModal();

    // Handle successful login
    const handleLoginSuccess = () => {
        closeLoginModal();
        // Add any additional logic after successful login
        // For example: refresh user data, update UI, etc.
    };

    // Handle successful registration
    const handleRegisterSuccess = () => {
        closeRegisterModal();
        // Add any additional logic after successful registration
    };

    return (
        <>
            {/* Login Modal */}
            <LoginModal
                open={isLoginModalOpen}
                onClose={closeLoginModal}
                onLoginSuccess={handleLoginSuccess}
                onRegisterClick={switchToRegister} // Add this line
                initialData={loginPrefillData}
            />

            {/* Register Modal */}
            <RegisterModal
                open={isRegisterModalOpen}
                onClose={closeRegisterModal}
                onRegisterSuccess={handleRegisterSuccess}
                onLoginClick={() => switchToLogin()}
            />

            {/* Other modals... */}
        </>
    );
};

// Example of a navbar using the modals
export const NavBar: React.FC = () => {
    const {
        openLoginModal,
        openRegisterModal
    } = useModal();

    return (
        <div className="navbar">
            <button onClick={() => openLoginModal()}>Log In</button>
            <button onClick={() => openRegisterModal()}>Register</button>
        </div>
    );
};