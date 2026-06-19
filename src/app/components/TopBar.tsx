import { useEffect, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { c, FONT } from "../../styles/theme";

export default function TopBar() {
  const [user, setUser] = useState({
    name: "Recruiter",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    setUser({
      name:
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "Recruiter",

      email: data.user.email || "",

      avatar:
        data.user.user_metadata?.avatar_url || "",
    });
  }


  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }


  return (
    <header
      className="
      mb-6
      flex
      items-center
      justify-between
      rounded-2xl
      border
      px-5
      py-3

      max-sm:px-4
      "
      style={{
        background: c.surface,
        borderColor: c.border,
        fontFamily: FONT,
      }}
    >


      {/* LEFT */}

      <div>
        <div
          className="flex items-center gap-2 text-sm font-bold"
          style={{ color: c.text }}
        >
          <Sparkles
            size={17}
            style={{ color: c.amber }}
          />

          ResumeAI
        </div>


        <p
          className="
          mt-0.5
          text-xs
          max-sm:hidden
          "
          style={{
            color: c.textDim,
          }}
        >
          AI Powered Resume Screening Platform
        </p>
      </div>



      {/* RIGHT PROFILE */}


      <div className="flex items-center gap-3">

        <div
          className="
          flex
          h-10
          w-10
          items-center
          justify-center
          overflow-hidden
          rounded-full
          text-sm
          font-bold
          "
          style={{
            background: c.amberDim,
            color: c.amber,
          }}
        >

          {user.avatar ? (

            <img
              src={`${user.avatar}?v=${Date.now()}`}
              className="
              h-full
              w-full
              object-cover
              "
            />

          ) : (

            user.name[0]

          )}

        </div>


        <div className="hidden sm:block">

          <p
            className="text-sm font-semibold"
            style={{
              color:c.text,
            }}
          >
            {user.name}
          </p>


          <p
            className="text-xs"
            style={{
              color:c.textDim,
            }}
          >
            {user.email}
          </p>

        </div>


        <button
          onClick={logout}
          className="
          flex
          items-center
          gap-2
          rounded-xl
          px-3
          py-2
          text-xs
          font-semibold
          "
          style={{
            background:c.amber,
            color:"#111827",
          }}
        >

          <LogOut size={14}/>

          Logout

        </button>

      </div>


    </header>
  );
}