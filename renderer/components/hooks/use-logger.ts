import { logAtom, logTimesAtom } from "../../atoms/log-atom";
import log from "electron-log/renderer";
import { useSetAtom } from "jotai";

const useLogger = () => {
  const setLogData = useSetAtom(logAtom);
  const setLogTimes = useSetAtom(logTimesAtom);

  const logit = (...args: any) => {
    // Native diagnostics are already written by the main process. Sending
    // them straight back through electron-log doubles traffic during a job.
    if (!String(args[0]).match(/BACKEND REPORTED|UPSCAYL_PROGRESS/)) log.log(...args);

    const data = [...args].join(" ");
    setLogTimes((times) => [...times.slice(-999), Date.now()]);
    setLogData((prevLogData) => [...prevLogData.slice(-999), data]);
  };

  return logit;
};

export default useLogger;
