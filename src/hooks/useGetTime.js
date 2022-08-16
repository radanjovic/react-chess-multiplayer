import { useState, useEffect } from "react";

const useGetTime = (time) => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let minutes = Math.floor(+time / 60);
        let seconds = +time - (minutes * 60);

        setMinutes(String(minutes >= 10 ? String(minutes) : String(`0${minutes}`)));
        setSeconds(seconds >= 10 ? String(seconds) : String(`0${seconds}`));

    }, [time]);

    return {minutes, seconds};
}

export default useGetTime;