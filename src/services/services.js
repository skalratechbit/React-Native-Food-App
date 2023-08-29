import axios from 'axios';
import { TIME_OUT, TOKEN } from '../config/constants/network_constants';
import RNFetchBlob from 'rn-fetch-blob';

export function postDataService(params, APIURL, token) {
  var httpClient = axios.create();
  httpClient.defaults.timeout = TIME_OUT;
  httpClient.defaults.headers.post['Content-Type'] = 'multipart/form-data; boundary=<calculated when request is sent>';
  httpClient.defaults.headers.post['Authorization'] = token ? token : TOKEN;

  console.log('PARAMS:', params);
  console.log('APIURL:', APIURL);

  return httpClient
    .post(APIURL, params)
    .then(function(response) {
      console.log('api_response_success', response);
      return response;
    })
    .catch(function(error) {
      if (error.response) {
        console.log('error.response.data:', error.response.data);
        console.log('error.response.status:', error.response.status);
        console.log('error.response.headers:', error.response.headers);
        console.log('error in saga uper  ', error.response.data);
        return { error: error.response.data.error };
      } else {
        console.log('Error Message:', error.message);

        return { error: error.message };
      }
      console.log('error.config:', error.config);
    });
}

export function postDataServiceWithFormData(params, APIURL) {
  var httpClient = axios.create();
  httpClient.defaults.timeout = TIME_OUT;
  httpClient.defaults.headers.post['Content-Type'] = 'multipart/form-data';
  console.log('FormData PARAMS:', params);
  console.log('FormData APIURL:', APIURL);

  return httpClient
    .post(APIURL, params)
    .then(function(response) {
      console.log('api_response_success', response);
      return response;
    })
    .catch(function(error) {
      if (error.response) {
        console.log('error.response.data:', error.response.data);
        console.log('error.response.status:', error.response.status);
        console.log('error.response.headers:', error.response.headers);
        console.log('error in saga uper  ', error.response.data);

        return { error: error.response.data.error };
      } else {
        console.log('Error Message:', error.message);

        return { error: error.message };
      }
      console.log('error.config:', error.config);
    });
}
export function getDataService(APIURL, token) {
  var httpClient = axios.create();
  httpClient.defaults.timeout = TIME_OUT;
  httpClient.defaults.headers.get['Authorization'] = token;
  //return instance.get(URL);
  console.log('APIURL:', APIURL);
  return httpClient
    .get(APIURL)
    .then(function(response) {
      console.log('api_response_success', response);
      return response;
    })
    .catch(function(error) {
      if (error.response) {
        console.log('failure error.response.data:', error.response.data);
        console.log('failure error.response.status:', error.response.status);
        console.log('failure error.response.headers:', error.response.headers);
        return { error: error.response.data.error };
      } else {
        console.log(' failure Error Message:', error.message);
        console.log(' failure Error Message:', error);
        return { error: error.message };
      }

      console.log('error.config:',error.config);
    });
}

export function postDataServiceWithFile(params, APIURL) {
  console.log('postDataServiceWithFile');
  console.log('PARAMS:', params);
  console.log('APIURL:', APIURL);

  const contentType = {
    'Content-Type': 'multipart/form-data'
  };
  return RNFetchBlob.fetch('POST', APIURL, contentType, params)
    .then(resp => {
      console.log('api_response_success', response);
      return response;
    })
    .catch(error => {
      console.log(error)
      if (error.response) {
        console.log('error.response.data:', error.response.data);
        console.log('error.response.status:', error.response.status);
        console.log('error.response.headers:', error.response.headers);
        console.log('error in saga uper  ', error.response.data);
        return { error: error.response.data.error };
      } else {
        console.log('Error Message:', error.message);

        return { error: error.message };
      }
      console.log('error.config:', error.config);
    });
}
