import React from 'react';
import moment from 'moment-timezone';

interface Props {
  id: string | number;
  time: string | Date;
  type: 'prep' | 'pickup';
}
const Timer: React.FC<Props> = ({ time, id, type }) => {
  const newTime = time || new Date();
  const minutes = moment(newTime).diff(moment(), 'minutes');
  // const [minutes, setMinutes] = useState(
  //   Number(moment(newTime).diff(moment(), 'minutes')),
  // );
  // const [seconds, setSeconds] = useState(Number(moment(newTime).format('ss')));

  // useEffect(() => {
  //   let interval: NodeJS.Timer;
  //   if (moment().isBefore(newTime) && type === 'prep') {
  //     interval = setInterval(() => {
  //       setSeconds((seconds) => {
  //         if (seconds === 0) {
  //           setMinutes((minutes) => minutes - 1);
  //           return 59;
  //         } else {
  //           return seconds - 1;
  //         }
  //       });
  //     }, 1000);
  //   }
  //   return () => clearInterval(interval);
  // }, [seconds]);
  return (
    <React.Fragment>
      {minutes <= 0 && type === 'prep' ? (
        <div key={`${id}${type}`} className="blink">
          NOW
        </div>
      ) : (
        <React.Fragment>
          {type === 'pickup' ? (
            <div key={`${id}${type}`}>{moment(newTime).format('HH:mm')}</div>
          ) : (
            <div key={`${id}${type}`}>
              {minutes}
              <small>min</small>
            </div>
          )}
        </React.Fragment>
      )}
      <style jsx>{`
        .blink {
          animation: blinker 1s linear infinite;
        }

        @keyframes blinker {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </React.Fragment>
  );
};

export default Timer;
