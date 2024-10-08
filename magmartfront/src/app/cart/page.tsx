"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartData, CartItem } from "@/components/myTypes/CartType";
import GetUserCart from "../api/getUserCart";
import GetPaymentMethods, { PaymentMethod } from "@/APIs/getPaymentMethods";
import CardCarrinho from "@/components/CardCarrinho";
import Link from "next/link";
import removeItemFromCart from "@/APIs/removeItemFromCart";
import FinishPurchase from "@/APIs/finishPurchase";
import SuccessModal from "@/components/SucessModel";
import { Input } from "@mui/material";
import EditCartItem from "../api/editCartItem";
import DeleteIcon from '@mui/icons-material/Delete';
import { red } from "@mui/material/colors";

function Carrinho() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [previousQuantity, setPreviousQuantity] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  async function fetchData() {
    try {
      const cart = await GetUserCart(); // Busca o carrinho do usuário
      setCartData(cart);

      const methods = await GetPaymentMethods(); // Busca os métodos de pagamento
      setPaymentMethods(methods);

      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id); // Define o primeiro método como padrão
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPaymentMethod(event.target.value); // Atualiza o método de pagamento selecionado
  };

  const handleShowPaymentOptions = () => {
    if (cartData && cartData.items.length > 0) {
      setShowPaymentOptions(true);
    } else {
      console.log("O carrinho está vazio. Não é possível finalizar a compra.");
    }
  };

  const handlePurchase = async () => {
    if (cartData && cartData.items.length > 0 && selectedPaymentMethod) {
      try {
        await FinishPurchase(
          cartData.user_id,
          cartData.id,
          selectedPaymentMethod
        );
        console.log("Compra finalizada com sucesso");
        setShowSuccessModal(true); // Mostra o modal de sucesso
        // Não redireciona imediatamente, pois queremos mostrar o modal de sucesso primeiro
      } catch (error) {
        console.error("Erro ao finalizar a compra:", error);
      }
    } else {
      console.log(
        "O carrinho está vazio ou nenhum método de pagamento foi selecionado."
      );
    }
  };

  const handleDelete = async (id: string, cart_id: string) => {
    console.log("deleting\n ", id);

    await removeItemFromCart(cart_id, id);
    await fetchData();

    console.log("Item deleted\n ", id);
  };

  const handleConfirm = async (cart_id: string, item_id: string) => {
      // Aqui você pode adicionar lógica para salvar a quantidade no estado global ou API
      if (quantity != previousQuantity){
        await EditCartItem(cart_id,item_id,Number(quantity))
        console.log(`Item ${item_id} nova quantidade: ${quantity}`);
        setPreviousQuantity(quantity)
        setEditingItemId(null); // Sai do modo de edição
        await fetchData();
      }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-row min-h-screen w-screen h-full justify-center gap-4 p-8 flex-wrap">
        <div className="flex flex-row min-h-screen h-full w-screen justify-center gap-4 p-8 flex-wrap">
          <div className="flex flex-row w-[60%] border h-full rounded-md shadow-2xl justify-center gap-4 p-2 flex-wrap overflow-hidden">
            {cartData?.items.map((item: CartItem) => (
              <div
                className="flex flex-row w-full h-1/3 rounded border overflow-hidden shadow-lg"
                key={item.id}
              >
                <div className="flex flex-row items-center w-full h-full">
                  <a href={`/pokemon/${item.pokemon.id}`}>
                    <img
                      className="w-[80%] h-[140%]"
                      src={item.pokemon.image_url}
                      alt={item.pokemon.name}
                    />
                  </a>
                  <div className="px-6 py-4">
                    <label>Pokemon</label>
                    <div className="text-xl mb-2">{item.pokemon.name}</div>
                  </div>
                  <div className="px-6 py-4">
                    <label>Preço</label>
                    <div className="text-xl mb-2">R${item.price}</div>
                  </div>
                  <div className="px-6 py-4">
                    <label>Quantidade</label>
                    {editingItemId === item.id ? (
                    <div className="text-xl mb-2">
                      <input
                        type="number"
                        min="1"
                        max={100}
                        className="border p-1"
                        defaultValue={item.quantity} // Saída do modo de edição ao perder foco
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                      <button
                        className="ml-2 p-1 text-orange-500"                        
                        onClick={() => handleConfirm(item.cart_id,item.id)}
                      >
                        Confirmar
                      </button>
                    </div>
                  ) : (
                    <div className="text-xl mb-2">
                      {item.quantity}
                      <button
                        className="ml-2 p-1 text-orange-500"
                        onClick={() => {
                          setEditingItemId(item.id);
                          setQuantity(item.quantity); // Inicializa o valor da quantidade com o valor atual
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                  </div>
                </div>
                <div className="m-5">
                  <DeleteIcon
                    sx={{ color: red[600] }}
                    onClick={() => handleDelete(item.id, item.cart_id)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-row w-[30%] h-1/2 rounded-md shadow-2xl gap-4 p-8 flex-wrap overflow-hidden">
            <div className="flex flex-row w-full h-1/3 rounded overflow-hidden shadow-xl">
              { showPaymentOptions ? (
                <div className="flex flex-col items-center justify-center px-6 ">
                  <div>
                      <label htmlFor="">Escolha sua Forma de pagamento</label>
                      <select
                        className="border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={selectedPaymentMethod}
                        onChange={handlePaymentMethodChange}
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name}
                          </option>
                        ))}
                      </select>
                  </div>
                  <button className='bg-orange-600 m-20 w-full p-2 rounded-md' onClick={handlePurchase}>
                      Finalizar pagamento
                  </button>
              </div>)
              : (<div className="px-6 py-4">
                <div className="font-bold text-lg mb-2">
                  {`Subtotal (${cartData?.items.length || 0} produtos) R$${
                    cartData?.total || 0
                  }`}
                </div>
                <button
                  className="bg-orange-600 w-full p-2 rounded-md"
                  onClick={handleShowPaymentOptions}
                >
                  Fechar pedido
                </button>
              </div>)}
            </div>
          </div>
        </div>
        {showPaymentOptions && ( // Renderiza o bloco de pagamento apenas se showPaymentOptions for true
                  <div className="flex flex-row w-[90%] h-1/2 justify-center rounded-md shadow-2xl gap-4 p-8 flex-wrap overflow-hidden">
                      <div className="flex flex-row justify-center w-[50%] h-1/3 rounded overflow-hidden shadow-xl">
                          <div className="flex flex-col items-center justify-center px-6 ">
                              <div>
                                  <label htmlFor="">Escolha sua Forma de pagamento</label>
                                  <select
                                    className="border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={selectedPaymentMethod}
                                    onChange={handlePaymentMethodChange}
                                  >
                                    {paymentMethods.map((method) => (
                                      <option key={method.id} value={method.id}>
                                        {method.name}
                                      </option>
                                    ))}
                                  </select>
                              </div>
                              <button className='bg-orange-600 m-20 w-full p-2 rounded-md' onClick={handlePurchase}>
                                  Finalizar pagamento
                              </button>
                          </div>
                      </div>
                  </div>
              )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        mensagem1="Pagamento bem-sucedido!"
        mensagem2="Seu pagamento foi realizado com sucesso."
        rota="/profile/orders"
      />

      <Footer />
    </div>
  );
}

export default Carrinho;
