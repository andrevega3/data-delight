export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const truncateAddress = (address: string, length: number) => {
    if (address.length <= length) return address;
    return `${address.substring(0, length)}...`;
};