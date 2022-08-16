import { useState, useEffect } from "react";

function getWindowDimensions() {
    const {innerWidth: w, innerHeight: h} = window;
    return {w, h};
}

export default function useWindowDimensions() {
    const [wd, setWD] = useState(getWindowDimensions());

    useEffect(() => {
        window.addEventListener('resize', () => setWD(getWindowDimensions()))
        return () => window.removeEventListener('resize', () => setWD(getWindowDimensions()))
    }, []);

    return wd;
}