import FullPageLoader from "@/components/shared/FullPageLoader";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [verifyEmail, { isLoading }] = useVerifyEmailMutation();

    useEffect(() => {
        const verify = async () => {
             if (!email || !otp) {
                 toast.error("Invalid verification link.");
                 navigate("/login");
                 return;
             }
 
             try {
                 const result = await verifyEmail({ email, otp }).unwrap();
                 dispatch(setCredentials(result.data));
                 toast.success("Email verified successfully!");
                 
                 // Redirect to Landing Page as requested
                 navigate('/');
             } catch (err) {
                 toast.error(err.data?.message || "Verification failed. Link may be expired.");
                 navigate("/login");
             }
        };

        verify();
    }, [email, otp, verifyEmail, dispatch, navigate]);

    return (
        <FullPageLoader message="Verifying your email..." />
    );
};

export default VerifyEmail;
