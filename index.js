const axios = require('axios');

module.exports = function(app) {
  const pluginId = 'custom-plugin';

  const plugin = {
    id: pluginId,
    name: 'Custom Plugin',
    description: 'A custom Signal K plugin that fetches data and updates Signal K paths.',
    schema: {
      type: 'object',
      properties: {
        apiURL: {
          type: 'string',
          title: 'API URL',
          default: 'https://data.aishub.net/stations.php?username=AH_3017_A0DC769C&format=1&output=json&compress=0&id=3017',
        },
        signalKPaths: {
          type: 'object',
          title: 'Signal K Paths',
          properties: {
            ships: {
              type: 'string',
              title: 'Ships Path',
              default: 'environment.ships',
            },
            distinct: {
              type: 'string',
              title: 'Distinct Path',
              default: 'environment.distinct',
            },
          },
        },
      },
    },
    start: function(options) {
      const { apiURL, signalKPaths } = options;

      const fetchDataAndWriteToSignalK = async () => {
        try {
          const response = await axios.get(apiURL);
          const data = response.data;

          if (Array.isArray(data) && data.length > 1) {
            const shipData = data[1][0];

            const updates = [
              {
                source: { label: 'Custom Plugin' },
                values: [
                  {
                    path: signalKPaths.ships,
                    value: shipData.SHIPS,
                  },
                  {
                    path: signalKPaths.distinct,
                    value: shipData.DISTINCT,
                  },
                ],
              },
            ];

            app.handleMessage(pluginId, { updates });
            console.log('Data has been written to Signal K paths.');
          } else {
            console.error('Invalid or empty data in the API response.');
          }
        } catch (error) {
          console.error('Error fetching data from the API or writing to Signal K:', error);
        }
      };

      // Set up an interval to fetch and update data periodically
      setInterval(fetchDataAndWriteToSignalK, 60000); // Adjust the interval as needed
    },
  };

  return plugin;
};
