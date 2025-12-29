import Swal from 'sweetalert2';

export async function deleteDataAlert(title, text, confirmText = "Sí, eliminar!") {
  return Swal.fire({
    title: title || "¿Estás seguro?",
    text: text || "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar"
  })
}

export const showSuccessAlert = (titleMessage, message) => {
  Swal.fire(
    titleMessage,
    message,
    'success'
  );
};

export const showErrorAlert = (titleMessage, message) => {
  Swal.fire(
    titleMessage,
    message,
    'error'
  );
};

export const showAlert = (title, message, icon) => {
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    confirmButtonColor: '#3085d6'
  });
};

export const showConfirmAlert = async (title, message) => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
};