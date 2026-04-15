import React from "react";

export function DebouncedInput({
                                   value: initialValue,
                                   onChange,
                                   debounce = 500,
                                   ...props
                               }: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue)

    // Đồng bộ giá trị từ URL xuống state local
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // FIX LỖI Ở ĐÂY: Chỉ gọi onChange nếu giá trị local bị thay đổi
            // so với giá trị truyền vào. Điều này cắt đứt vòng lặp vô hạn!
            if (value !== initialValue) {
                onChange(value);
            }
        }, debounce);

        return () => clearTimeout(timeout);

        // Cố tình bỏ qua cảnh báo của ESLint cho deps array ở đây
        // vì ta không muốn re-run khi onChange bị đổi reference
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, debounce, initialValue]);

    return (
        <input
            {...props}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    )
}