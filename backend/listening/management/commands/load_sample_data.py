"""
Create sample listening tests, items, questions and options.
Run: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from listening.models import ListeningTest, ListeningItem, Question, ChoiceOption


def add_options(question, correct_label, options_texts):
    labels = ['A', 'B', 'C', 'D']
    for i, (label, text) in enumerate(zip(labels, options_texts)):
        ChoiceOption.objects.create(
            question=question,
            label=label,
            text=text,
            is_correct=(label == correct_label),
            order=i + 1,
        )


class Command(BaseCommand):
    help = 'Load sample TOEFL Listening tests and questions'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Delete existing tests before loading')

    def handle(self, *args, **options):
        if options.get('clear'):
            ListeningTest.objects.all().delete()
            self.stdout.write('Cleared existing tests.')

        if ListeningTest.objects.exists():
            self.stdout.write(self.style.WARNING('Tests already exist. Use --clear to replace.'))
            return

        # ---- REAL 1 ----
        t1 = ListeningTest.objects.create(
            title='REAL 1',
            version_id='v1',
            total_items=0,
            is_active=True,
        )
        conv1 = ListeningItem.objects.create(
            test=t1,
            difficulty='medium',
            topic_tag='Campus',
            transcript="""Narrator: Listen to a conversation between a student and a facilities manager.

Student: Hi, I'm here about the desk in the library study room. The one near the window is broken—the drawer won't close.

Employee: Oh, we've had a few reports about that. Let me take your name and the exact location. Which study room number?

Student: It's room 3, on the second floor. The desk right by the window.

Employee: Got it. I'll put in a work order. It should be fixed by the end of the week. Is there anything else?

Student: No, that's all. Thanks.""",
            item_type='conversation',
            order=1,
        )
        q1 = Question.objects.create(
            item=conv1,
            text='Why does the student go to the facilities management office?',
            question_type='main_idea',
            score_weight=1,
            order=1,
            explanation='The student explicitly states she is there about a broken desk in the library and describes the problem.',
        )
        add_options(q1, 'A', [
            'To report a broken desk in the library.',
            'To inquire about the availability of study rooms.',
            'To request a repair for a faulty air conditioner in the dorm.',
            'To complain about the noise level in the common area.',
        ])

        q2 = Question.objects.create(
            item=conv1,
            text='Which study room is the student referring to?',
            question_type='detail',
            score_weight=1,
            order=2,
            explanation='The student says "It\'s room 3, on the second floor."',
        )
        add_options(q2, 'B', [
            'Room 1 on the first floor.',
            'Room 3 on the second floor.',
            'Room 5 on the third floor.',
            'The room near the main entrance.',
        ])

        lec1 = ListeningItem.objects.create(
            test=t1,
            difficulty='medium',
            topic_tag='Biology',
            transcript="""Narrator: Listen to part of a lecture in a biology class.

Professor: Today we'll look at how certain plants adapt to dry environments. One key mechanism is crassulacean acid metabolism, or CAM. In CAM plants, the stomata open at night to take in carbon dioxide and close during the day to reduce water loss. This is the opposite of what most plants do. The cactus is a classic example. By storing CO2 at night and using it for photosynthesis during the day, the cactus can survive with very little water. Other CAM plants include pineapple and agave.""",
            item_type='lecture',
            order=2,
        )
        q3 = Question.objects.create(
            item=lec1,
            text='What is the main idea of the lecture?',
            question_type='main_idea',
            score_weight=1,
            order=1,
            explanation='The professor introduces CAM as a key mechanism for plants in dry environments and explains how it works.',
        )
        add_options(q3, 'C', [
            'Cacti are the only plants that survive in deserts.',
            'Stomata always open during the day.',
            'CAM allows plants to conserve water in dry environments.',
            'Pineapple and agave are not related to cacti.',
        ])

        # ---- REAL 2 ----
        t2 = ListeningTest.objects.create(
            title='REAL 2',
            version_id='v1',
            total_items=0,
            is_active=True,
        )
        conv2 = ListeningItem.objects.create(
            test=t2,
            difficulty='easy',
            topic_tag='Registration',
            transcript="""Narrator: Listen to a conversation between a student and an advisor.

Student: I need to add a course but the deadline passed. Is there any way to still register?

Advisor: It depends. What course is it?

Student: Introduction to Psychology. It's full but I really need it this semester.

Advisor: You can submit a late add form with your professor's signature. If they approve and there's space, we can add you. Have you spoken to the professor?

Student: Not yet. I'll go to their office hours tomorrow.

Advisor: Good. Bring the form and your student ID when you come back.""",
            item_type='conversation',
            order=1,
        )
        q4 = Question.objects.create(
            item=conv2,
            text='What does the student want to do?',
            question_type='main_idea',
            score_weight=1,
            order=1,
            explanation='The student says they need to add a course and asks if they can still register after the deadline.',
        )
        add_options(q4, 'A', [
            'Register for a course after the deadline.',
            'Drop a course.',
            'Change his major.',
            'Get a signature for a scholarship.',
        ])

        q5 = Question.objects.create(
            item=conv2,
            text="What must the student do next?",
            question_type='detail',
            score_weight=1,
            order=2,
            explanation='The advisor says the student should get the professor\'s signature and can go to office hours. The student says they will go tomorrow.',
        )
        add_options(q5, 'B', [
            'Pay a late fee at the bursar.',
            'Get the professor\'s approval and bring the form back.',
            'Wait until next semester.',
            'Choose a different course.',
        ])

        # ---- REAL 3 ----
        t3 = ListeningTest.objects.create(
            title='REAL 3',
            version_id='v1',
            total_items=0,
            is_active=True,
        )
        lec2 = ListeningItem.objects.create(
            test=t3,
            difficulty='hard',
            topic_tag='History',
            transcript="""Narrator: Listen to part of a lecture in a history class.

Professor: The Silk Road was not a single road but a network of trade routes connecting East and West. Silk was one of the main commodities, but spices, glass, and ideas also traveled along these routes. Buddhism spread from India to China largely through Silk Road contact. The routes declined when sea trade became safer and faster, but their impact on culture and technology was lasting. Marco Polo's travels in the 13th century were along these same networks.""",
            item_type='lecture',
            order=1,
        )
        q6 = Question.objects.create(
            item=lec2,
            text='According to the professor, what is true about the Silk Road?',
            question_type='detail',
            score_weight=1,
            order=1,
            explanation='The professor states that the Silk Road was a network of routes, not a single road, and that silk, spices, glass, and ideas were traded.',
        )
        add_options(q6, 'B', [
            'It was a single road from China to Rome.',
            'It was a network of routes trading goods and ideas.',
            'It was used only for silk.',
            'It was replaced by land routes.',
        ])

        q7 = Question.objects.create(
            item=lec2,
            text='Why did the Silk Road decline?',
            question_type='inference',
            score_weight=1,
            order=2,
            explanation='The professor says the routes declined when sea trade became safer and faster.',
        )
        add_options(q7, 'C', [
            'Because of wars in Central Asia.',
            'Because silk became less valuable.',
            'Because sea trade became safer and faster.',
            'Because Marco Polo stopped traveling.',
        ])

        # ---- TOEFL Practice 1 ----
        t4 = ListeningTest.objects.create(
            title='TOEFL Practice 1',
            version_id='v1',
            total_items=0,
            is_active=True,
        )
        conv3 = ListeningItem.objects.create(
            test=t4,
            difficulty='medium',
            topic_tag='Library',
            transcript="""Narrator: Listen to a conversation between a student and a librarian.

Student: I'm looking for articles on climate change and agriculture. Do you have anything from the last two years?

Librarian: Yes. You can use our database—just go to the library website and click "Databases." Search for "Environmental Science." You'll find several journals there. You can filter by date.

Student: Can I access it from off campus?

Librarian: Yes, but you need to log in with your university ID. Otherwise you won't get full access.

Student: Great, thanks.""",
            item_type='conversation',
            order=1,
        )
        q8 = Question.objects.create(
            item=conv3,
            text='What does the student need to do to access the database from off campus?',
            question_type='detail',
            score_weight=1,
            order=1,
            explanation='The librarian says the student needs to log in with their university ID for off-campus access.',
        )
        add_options(q8, 'B', [
            'Come to the library in person.',
            'Log in with their university ID.',
            'Pay a subscription fee.',
            'Use a specific browser.',
        ])

        # ---- TOEFL Practice 2 ----
        t5 = ListeningTest.objects.create(
            title='TOEFL Practice 2',
            version_id='v1',
            total_items=0,
            is_active=True,
        )
        lec3 = ListeningItem.objects.create(
            test=t5,
            difficulty='medium',
            topic_tag='Psychology',
            transcript="""Narrator: Listen to part of a lecture in a psychology class.

Professor: Classical conditioning was first demonstrated by Ivan Pavlov. He noticed that dogs salivated not only when they saw food but also when they heard the footsteps of the person who fed them. He then paired a neutral stimulus—a bell—with the presentation of food. After repeated pairings, the dogs salivated at the sound of the bell alone. The bell had become a conditioned stimulus. This principle has been used in advertising, education, and therapy.""",
            item_type='lecture',
            order=1,
        )
        q9 = Question.objects.create(
            item=lec3,
            text='What did Pavlov discover in his experiment?',
            question_type='detail',
            score_weight=1,
            order=1,
            explanation='Pavlov found that after pairing a bell with food, the dogs salivated at the sound of the bell alone.',
        )
        add_options(q9, 'A', [
            'Dogs could learn to associate a neutral stimulus with a response.',
            'Dogs only salivate when they see food.',
            'Bells are harmful to dogs.',
            'Food is the only effective reward.',
        ])

        q10 = Question.objects.create(
            item=lec3,
            text='According to the professor, where has classical conditioning been applied?',
            question_type='detail',
            score_weight=1,
            order=2,
            explanation='The professor says the principle has been used in advertising, education, and therapy.',
        )
        add_options(q10, 'D', [
            'Only in laboratory settings.',
            'Only with animals.',
            'Only in Russia.',
            'In advertising, education, and therapy.',
        ])

        # Update total_items via signal (or manually)
        for t in [t1, t2, t3, t4, t5]:
            t.total_items = t.items.count()
            t.save(update_fields=['total_items'])

        self.stdout.write(self.style.SUCCESS(
            f'Created 5 tests, {ListeningItem.objects.count()} items, '
            f'{Question.objects.count()} questions, {ChoiceOption.objects.count()} options.'
        ))
