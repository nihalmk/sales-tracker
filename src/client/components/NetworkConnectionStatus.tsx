import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_NETWORK_STATUS, NetworkStatus } from '../graphql/query/network';

interface Props {}
const NetworkConnectionStatus: React.FC<Props> = () => {
  const [online, setOnline] = useState(false);
  const { data: networkStatus } = useQuery<NetworkStatus>(GET_NETWORK_STATUS);
  const status = networkStatus?.networkStatus.isConnected;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (status) {
      timeout = setTimeout(() => {
        setOnline(true);
      }, 5000);
    } else {
      setOnline(false);
    }
    return function cleanup() {
      timeout && clearTimeout(timeout);
    };
  }, [networkStatus]);
  return (
    <React.Fragment>
      {
        <div
          className={`card position-bottom bg-${
            status ? 'online' : 'offline'
          } ${online && 'd-none'}`}
        >
          <div className="card-body text-center text-white">
            <h4>
              {status
                ? 'Connected!'
                : 'Unable to connect servers. Please check your internet connection!'}
            </h4>
          </div>
        </div>
      }
      <style jsx global>{`
        .d-none {
          transition: 5s ease-out;
        }
        .text-white {
          color: white;
        }
        .bg-offline {
          background: #ff0100;
        }
        .bg-online {
          background: #5fbb00;
        }
        .position-bottom {
          position: absolute;
          width: 35%;
          bottom: 0;
          z-index: 99999;
        }
      `}</style>
    </React.Fragment>
  );
};

export default NetworkConnectionStatus;
