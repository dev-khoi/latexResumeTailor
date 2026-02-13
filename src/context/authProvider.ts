// "use client";
// import { useEffect } from "react";
// import { useState } from "react";
// import { createContext, ReactNode } from "react";
// import client from "@/api/client";
// const AuthContext = createContext(null);

// const AuthProvider = ({children}: {children: ReactNode}) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const getSession = async () => {
//             const session = await client.auth.getSession();
//             setUser(session?.data?.session?.user ?? null);
//             setLoading(false);
//         };

//         getSession();

//         const { data: authListener } = client.auth.onAuthStateChange(
//             (event, session) => {
//                 setUser(session?.user ?? null);
//                 setLoading(false);
//             }
//         );

//         return () => {
//             authListener?.subscription.unsubscribe();
//         };
//     }, []);

//     return (
//         <AuthContext.Provider value={{ user, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }