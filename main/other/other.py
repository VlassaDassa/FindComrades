from django.db.models.fields.files import ImageFieldFile


def term_filter(list, string):
    def sort(a):
        b = [i for i in set(a)]
        b.remove(0)
        for ii in range(len(b) - 1):
            for i in range(len(b) - ii - 1):
                if b[i] < b[i + 1]:
                    a = b[i + 1]
                    b[i + 1] = b[i]
                    b[i] = a
        return b

    def get_key(d, value):
        for k, v in d.items():
            if v == value:
                return k


    string_score = {}
    for i in list:
        count_exist = 0
        for ii in string.lower():
            if ii in i:
                count_exist += 1

        string_score[i] = count_exist

    string_score_list = sort([i for i in string_score.values()])

    skills = []

    for i in string_score_list:
        for k, v in string_score.items():
            if v == i:
                skills.append(k)

    return skills











