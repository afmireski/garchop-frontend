import axios from 'axios';
import { CartData } from '@/components/myTypes/CartType';
import Cookies from 'js-cookie';

function GetUserCart() {
  const token = Cookies.get('authToken');
  return axios.get<CartData>(`${process.env.API_URL}/cart`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`, // Adiciona o token ao cabeçalho
    },
  })
    .then(response => response.data)
    .catch(error => {
      throw new Error('Failed to fetch cart');
    });
}

export default GetUserCart;
