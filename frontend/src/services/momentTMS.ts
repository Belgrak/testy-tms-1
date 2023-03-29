import moment, {MomentInput} from "moment";
import 'moment/locale/en-gb';
import 'moment/locale/ru';
import i18next from "i18next";

export const MomentTMS = {
    initWithFormat: (input: MomentInput) => {
        moment.locale(i18next.language);
        return moment.utc(input, 'YYYY-MM-DDTHH:mm').local()
    },
    init: (input?: MomentInput, format?: string) => {
        moment.locale(i18next.language);
        return moment.utc(input, format).local()
    },
    initUTC: (input?: MomentInput, format?: string) => {
        moment.locale(i18next.language);
        return moment.utc(input, format)
    }
}
