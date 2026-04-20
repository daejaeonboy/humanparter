import React, { useEffect, useState } from 'react';

type ReactDatePickerComponent = typeof import('react-datepicker').default;

type DeferredDatePickerProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  className?: string;
};

const formatDateValue = (value?: Date | null) => {
  if (!value || Number.isNaN(value.getTime())) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DeferredDatePicker: React.FC<DeferredDatePickerProps> = ({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholderText,
  className,
}) => {
  const [DatePickerComponent, setDatePickerComponent] = useState<ReactDatePickerComponent | null>(null);
  const [koLocale, setKoLocale] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDatePicker = async () => {
      const [{ default: DatePicker }, localeModule] = await Promise.all([
        import('react-datepicker'),
        import('date-fns/locale/ko'),
        import('react-datepicker/dist/react-datepicker.css'),
      ]);

      if (!isMounted) return;

      setDatePickerComponent(() => DatePicker);
      setKoLocale((localeModule as { default?: unknown; ko?: unknown }).default || localeModule.ko);
    };

    void loadDatePicker();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!DatePickerComponent) {
    return (
      <input
        type="date"
        value={formatDateValue(selected)}
        min={formatDateValue(minDate)}
        max={formatDateValue(maxDate)}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue ? new Date(`${nextValue}T00:00:00`) : null);
        }}
        className={className}
        placeholder={placeholderText}
      />
    );
  }

  return (
    <DatePickerComponent
      selected={selected}
      onChange={onChange}
      dateFormat="yyyy-MM-dd"
      locale={koLocale || undefined}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={placeholderText}
      className={className}
    />
  );
};
