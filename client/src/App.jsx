import { Header, Footer, Loading } from "./components";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, refreshToken } from "./api/users";
import { login, logout } from "./store/authSlice";
import { useEffect } from "react";
import {gentext} from "./services/operations/cloudfareapi"
function App() {
    const [input, setInput] = useState('');
    const [data, setResponse] = useState('');
    
    const handleSubmit = async (e)=>{
        e.preventDefault();
        try {
            // can also create a slice for this and use dispatch for setting the data globally
            const response = await gentext(input);
            setResponse(response.result);
        } catch (error) {
            console.log(error);
            setResponse('An error occurred while fetching the response.');
        }
    }
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const refreshTokenMutation = useMutation({
        mutationFn: refreshToken,
        onSuccess: () => {
            // Re-fetch current user after successful token refresh
            queryClient.invalidateQueries(["currentUser"]);
        },
        onError: (error) => {
            console.error("Failed to refresh token:", error);
            dispatch(logout());
        }
    });

    const { isLoading, isError, data: response, error } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        retry: false,
    });

    useEffect(() => {
        if (isLoading) {
            return; // Handle loading state separately
        }
        if (isError) {
            dispatch(logout());
			if (error.response?.data?.message === "JWT expired") {
                // Trigger token refresh
                refreshTokenMutation.mutate();
            }
        } else if (response?.data?.data) {
            dispatch(login(response.data.data));
        }
    }, [isLoading, isError, response, dispatch, error]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loading className="w-32" />
            </div>
        );
    }
    return (
        <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your question"
        />
        <button type="submit">Submit</button>
      </form>
      {response && (
        <div>
          <h3>Response:</h3>
            <p>{data}</p>
        </div>
      )}
    </div>
        // <div className="wrapper min-h-screen">
        //     <Header />
        //     <Outlet />
        //     <Footer />
        // </div>
    );
}

export default App;