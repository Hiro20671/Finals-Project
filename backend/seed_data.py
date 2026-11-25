import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import StudentProfile
from marketplace.models import Category, AcademicMaterial, MaterialImage, Listing, Review, Report
from transactions.models import TransactionRequest, BorrowingRecord
from communications.models import Message, Notification


def seed():
    print("Clearing and populating realistic academic marketplace database...")

    # 1. Create Administrator
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@acadex.edu',
            'first_name': 'System',
            'last_name': 'Administrator',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()
    admin_profile = admin_user.student_profile
    admin_profile.role = 'ADMIN'
    admin_profile.university = 'Apex University Central'
    admin_profile.bio = 'System Administrator for Academic Exchange Platform'
    admin_profile.profile_picture_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    admin_profile.save()
    print("✓ Administrator created: admin / admin123")

    # 2. Create Students
    students_data = [
        {
            'username': 'maria.santos',
            'email': 'maria.santos@student.edu',
            'first_name': 'Maria',
            'last_name': 'Santos',
            'student_id': '2023-CS-0041',
            'university': 'College of Information and Computing Sciences',
            'degree_program': 'BS Computer Science',
            'year_level': '3rd Year',
            'contact_number': '+63 917 555 0101',
            'bio': 'Passionate CS junior focusing on algorithms and distributed systems. Happy to lend my sophomore notes!',
            'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            'rating': 4.95,
            'reviews_count': 12,
        },
        {
            'username': 'juan.delacruz',
            'email': 'juan.dc@student.edu',
            'first_name': 'Juan',
            'last_name': 'Dela Cruz',
            'student_id': '2022-MED-0189',
            'university': 'College of Nursing & Health Sciences',
            'degree_program': 'BS Nursing',
            'year_level': '4th Year',
            'contact_number': '+63 918 555 0122',
            'bio': 'Graduating nursing student passing down well-kept clinical textbooks, anatomy flashcards, and NCLEX reviewers.',
            'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            'rating': 4.88,
            'reviews_count': 9,
        },
        {
            'username': 'ana.reyes',
            'email': 'ana.reyes@student.edu',
            'first_name': 'Ana',
            'last_name': 'Reyes',
            'student_id': '2024-ACC-0331',
            'university': 'School of Business & Accountancy',
            'degree_program': 'BS Accountancy',
            'year_level': '2nd Year',
            'contact_number': '+63 919 555 0133',
            'bio': 'Accountancy major sharing reviewer books and auditing solutions. Looking for cost accounting materials.',
            'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
            'rating': 5.00,
            'reviews_count': 7,
        },
        {
            'username': 'david.lee',
            'email': 'david.lee@student.edu',
            'first_name': 'David',
            'last_name': 'Lee',
            'student_id': '2023-ENG-0512',
            'university': 'Faculty of Engineering',
            'degree_program': 'BS Civil Engineering',
            'year_level': '3rd Year',
            'contact_number': '+63 920 555 0144',
            'bio': 'Civil engineering enthusiast. Seeking calculus reviewers and offering fluid mechanics & surveying notes.',
            'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
            'rating': 4.80,
            'reviews_count': 5,
        },
        {
            'username': 'clara.bautista',
            'email': 'clara.b@student.edu',
            'first_name': 'Clara',
            'last_name': 'Bautista',
            'student_id': '2025-PSY-0078',
            'university': 'College of Liberal Arts & Sciences',
            'degree_program': 'BS Psychology',
            'year_level': '1st Year',
            'contact_number': '+63 921 555 0155',
            'bio': 'Freshman psychology student looking for general education reference books and introductory biology.',
            'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
            'rating': 5.00,
            'reviews_count': 3,
        },
    ]

    students = {}
    for s_info in students_data:
        user, created = User.objects.get_or_create(
            username=s_info['username'],
            defaults={
                'email': s_info['email'],
                'first_name': s_info['first_name'],
                'last_name': s_info['last_name'],
            }
        )
        user.set_password('student123')
        user.save()
        profile = user.student_profile
        profile.student_id_number = s_info['student_id']
        profile.university = s_info['university']
        profile.degree_program = s_info['degree_program']
        profile.year_level = s_info['year_level']
        profile.contact_number = s_info['contact_number']
        profile.bio = s_info['bio']
        profile.profile_picture_url = s_info['avatar']
        profile.average_rating = s_info['rating']
        profile.total_reviews_count = s_info['reviews_count']
        profile.save()
        students[s_info['username']] = user

    print(f"✓ Created {len(students)} student accounts (password: student123)")

    # 3. Create Categories
    categories_data = [
        ('Textbooks', 'textbooks', 'Curriculum textbooks for undergraduate and graduate courses', 'BookOpen'),
        ('Reviewers & Board Prep', 'reviewers-board-prep', 'Comprehensive exam review materials, licensure guides, and reviewers', 'FileCheck'),
        ('Lecture Notes & Summaries', 'lecture-notes-summaries', 'Condensed lecture notes, chapter summaries, and student study kits', 'FileText'),
        ('Study Guides & Solutions', 'study-guides-solutions', 'Problem-set solutions, formula sheets, and module walkthroughs', 'Bookmark'),
        ('Reference Materials & Handbooks', 'reference-materials', 'Engineering handbooks, medical references, law codals, and dictionaries', 'Layers'),
        ('Laboratory Manuals & Workbooks', 'lab-manuals-workbooks', 'Science and computer laboratory guides, activity sheets, and workbooks', 'FlaskConical'),
    ]

    cats = {}
    for name, slug, desc, icon in categories_data:
        cat, _ = Category.objects.get_or_create(name=name, defaults={'slug': slug, 'description': desc, 'icon_name': icon})
        cats[slug] = cat
    print(f"✓ Verified {len(cats)} categories")

    # 4. Create Academic Materials & Listings
    materials_catalog = [
        {
            'owner': students['maria.santos'],
            'category': cats['textbooks'],
            'title': 'Introduction to Algorithms, Fourth Edition (CLRS)',
            'author': 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
            'edition': '4th Edition (2022)',
            'publication_year': 2022,
            'isbn': '978-0262046305',
            'subject_code': 'CS201',
            'course_name': 'Data Structures & Algorithms Analysis',
            'description': 'The definitive textbook on algorithms. Kept in like-new condition, hardbound with zero pencil or highlighter markings. Available for lending to fellow CS/IT students during midterms and finals.',
            'condition': 'NEW',
            'image': 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'LEND',
            'price': 0.00,
            'lending_period_days': 14,
            'lending_deposit': 10.00,
            'exchange_pref': '',
        },
        {
            'owner': students['ana.reyes'],
            'category': cats['reviewers-board-prep'],
            'title': 'Practical Auditing & Theory Reviewer (2024 Edition)',
            'author': 'Conrado T. Valix & Christian Aris M. Valix',
            'edition': '2024 Comprehensive Edition',
            'publication_year': 2024,
            'isbn': '978-9710489234',
            'subject_code': 'ACC301',
            'course_name': 'Auditing Principles and Verification',
            'description': 'Up-to-date CPA board exam reviewer with answers and exhaustive solution explanations for all problems. Minimal neat highlighters on key accounting standards.',
            'condition': 'GOOD',
            'image': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'SALE',
            'price': 15.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': '',
        },
        {
            'owner': students['juan.delacruz'],
            'category': cats['textbooks'],
            'title': 'Guyton & Hall Textbook of Medical Physiology',
            'author': 'John E. Hall, PhD and Michael E. Hall, MD',
            'edition': '14th Edition',
            'publication_year': 2021,
            'isbn': '978-0323597128',
            'subject_code': 'NURS104',
            'course_name': 'Human Anatomy and Physiology',
            'description': 'Standard medical and nursing textbook. Clean text block, intact plastic cover, crisp clinical diagrams and colored illustrations. Selling at a student-friendly discounted price.',
            'condition': 'GOOD',
            'image': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'SALE',
            'price': 28.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': '',
        },
        {
            'owner': students['clara.bautista'],
            'category': cats['lecture-notes-summaries'],
            'title': 'Organic Chemistry 1 Complete Reaction Mechanism Guide',
            'author': 'Clara Bautista (Honors Student Notes)',
            'edition': 'Fall 2025 Semester Edition',
            'publication_year': 2025,
            'isbn': '',
            'subject_code': 'CHEM11',
            'course_name': 'Organic Chemistry for Pre-Med & Allied Health',
            'description': 'Handwritten and digitized 65-page color-coded summary sheet detailing SN1, SN2, E1, and E2 reaction mechanisms, arrow-pushing rules, and NMR spectroscopy charts. Donating freely for any struggling chem students!',
            'condition': 'NEW',
            'image': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'DONATION',
            'price': 0.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': '',
        },
        {
            'owner': students['david.lee'],
            'category': cats['textbooks'],
            'title': 'Calculus: Early Transcendentals (Stewart Calculus)',
            'author': 'James Stewart, Daniel K. Clegg, Saleem Watson',
            'edition': '9th Metric Edition',
            'publication_year': 2020,
            'isbn': '978-1337613927',
            'subject_code': 'MATH21',
            'course_name': 'Calculus 1 & 2 for Engineers',
            'description': 'Comprehensive calculus book covering limits, derivatives, integration, and multivariate vector calculus. Looking to exchange this for a Physics for Engineers or Mechanics book!',
            'condition': 'GOOD',
            'image': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'EXCHANGE',
            'price': 0.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': 'Looking for Young & Freedman University Physics 15th Ed or Hibbeler Engineering Mechanics: Statics.',
        },
        {
            'owner': students['david.lee'],
            'category': cats['reviewers-board-prep'],
            'title': 'Civil Engineering Licensure Exam Complete Review Primer',
            'author': 'Engr. D. Besavilla & Engr. G. Gillesania',
            'edition': 'Volume 1: Hydraulics & Geotechnical',
            'publication_year': 2023,
            'isbn': '978-9718534120',
            'subject_code': 'CE401',
            'course_name': 'CE Board Comprehensive Integration',
            'description': 'Proven review companion with past board exam problems solved step-by-step. Lending to engineering students preparing for midyear mock board examinations.',
            'condition': 'GOOD',
            'image': 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'LEND',
            'price': 0.00,
            'lending_period_days': 21,
            'lending_deposit': 5.00,
            'exchange_pref': '',
        },
        {
            'owner': students['maria.santos'],
            'category': cats['study-guides-solutions'],
            'title': 'Design Patterns: Elements of Reusable Object-Oriented Software',
            'author': 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (Gang of Four)',
            'edition': 'Classic Hardcover Edition',
            'publication_year': 2018,
            'isbn': '978-0201633610',
            'subject_code': 'CS302',
            'course_name': 'Software Engineering & System Architecture',
            'description': 'Essential reading for any software engineer. Detailed breakdown of Creational, Structural, and Behavioral patterns with C++ and Java code examples. For sale at great value.',
            'condition': 'FAIR',
            'image': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'SALE',
            'price': 12.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': '',
        },
        {
            'owner': students['juan.delacruz'],
            'category': cats['reference-materials'],
            'title': 'Bates’ Guide to Physical Examination and History Taking',
            'author': 'Lynn S. Bickley, Peter G. Szilagyi, Richard M. Hoffman',
            'edition': '13th Edition',
            'publication_year': 2021,
            'isbn': '978-1496398178',
            'subject_code': 'NURS205',
            'course_name': 'Health Assessment & Clinical Interview',
            'description': 'The gold standard guide for patient assessments, clinical interviewing, and physical examinations. Donating to 1st or 2nd year nursing students starting their hospital duty rotations.',
            'condition': 'GOOD',
            'image': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'DONATION',
            'price': 0.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': '',
        },
        {
            'owner': students['ana.reyes'],
            'category': cats['study-guides-solutions'],
            'title': 'Cost Accounting & Management Essentials Study Kit',
            'author': 'William K. Carter',
            'edition': '14th Edition Solutions & Summary',
            'publication_year': 2022,
            'isbn': '978-0759338098',
            'subject_code': 'ACC204',
            'course_name': 'Cost Accounting & Control',
            'description': 'Looking to exchange this comprehensive cost accounting solution set and problem workbook for an Intermediate Accounting 3 or Income Taxation reviewer.',
            'condition': 'NEW',
            'image': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
            'listing_type': 'EXCHANGE',
            'price': 0.00,
            'lending_period_days': 0,
            'lending_deposit': 0.00,
            'exchange_pref': 'Looking for Valencia & Roxas Income Taxation or Valix Intermediate Accounting 3.',
        },
    ]

    created_listings = []
    for item in materials_catalog:
        material = AcademicMaterial.objects.create(
            owner=item['owner'],
            category=item['category'],
            title=item['title'],
            author=item['author'],
            edition=item['edition'],
            publication_year=item['publication_year'],
            isbn=item['isbn'],
            subject_code=item['subject_code'],
            course_name=item['course_name'],
            description=item['description'],
            condition=item['condition'],
        )

        MaterialImage.objects.create(
            material=material,
            image_url=item['image'],
            is_primary=True,
        )

        listing = Listing.objects.create(
            material=material,
            listing_type=item['listing_type'],
            price=item['price'],
            lending_period_days=item['lending_period_days'],
            lending_deposit=item['lending_deposit'],
            exchange_preferences=item['exchange_pref'],
            status='AVAILABLE',
            approval_status='APPROVED',
            views_count=42,
        )
        created_listings.append(listing)

    print(f"✓ Created {len(created_listings)} listings across Textbooks, Reviewers, Notes, etc.")

    # 5. Create Transactions & Borrowing Records
    # Listing 0: Maria's CLRS book - Borrowed by David
    clrs_listing = created_listings[0]
    borrow_req = TransactionRequest.objects.create(
        listing=clrs_listing,
        requester=students['david.lee'],
        owner=students['maria.santos'],
        request_type='BORROW',
        status='ACCEPTED',
        message='Hi Maria! Could I borrow your CLRS book for our dynamic programming midterm exam? I can meet you at the CS building lobby.',
        owner_notes='Accepted! Let us meet tomorrow at 10 AM at the 2nd floor library study lounge.',
        meetup_location='CS Building Lobby / 2nd Floor Study Lounge',
        agreed_price=0.00,
    )
    clrs_listing.status = 'BORROWED'
    clrs_listing.save()

    BorrowingRecord.objects.create(
        transaction_request=borrow_req,
        listing=clrs_listing,
        borrower=students['david.lee'],
        lender=students['maria.santos'],
        borrowed_date=timezone.now() - timedelta(days=4),
        expected_return_date=timezone.now() + timedelta(days=10),
        status='ACTIVE',
        notes='Covered in plastic protector. Expected return in 10 days.',
    )

    # Listing 1: Ana's CPA Reviewer - Completed purchase by Maria
    cpa_listing = created_listings[1]
    buy_req = TransactionRequest.objects.create(
        listing=cpa_listing,
        requester=students['maria.santos'],
        owner=students['ana.reyes'],
        request_type='BUY',
        status='COMPLETED',
        message='Hello Ana! I would love to buy this CPA reviewer for my accounting elective. Is cash upon meetup okay?',
        owner_notes='Completed at Main Canteen. Cash received.',
        meetup_location='University Main Canteen',
        agreed_price=15.00,
        completed_at=timezone.now() - timedelta(days=2),
    )

    # Create Review for completed transaction
    Review.objects.create(
        transaction_request=buy_req,
        reviewer=students['maria.santos'],
        reviewed_user=students['ana.reyes'],
        rating=5,
        comment='The reviewer book was in pristine condition, exactly as described! Ana was very punctual and friendly during the meetup at the canteen.',
    )

    # 6. Create Direct Chat Messages
    msg1 = Message.objects.create(
        sender=students['david.lee'],
        receiver=students['maria.santos'],
        content='Hi Maria, thanks for agreeing to lend the Algorithms book! What time are you free tomorrow?',
        is_read=True,
    )
    msg2 = Message.objects.create(
        sender=students['maria.santos'],
        receiver=students['david.lee'],
        content='Hey David! I have a break between 10:00 AM and 11:30 AM. Meet me near the reference section in the main library!',
        is_read=True,
    )
    msg3 = Message.objects.create(
        sender=students['david.lee'],
        receiver=students['maria.santos'],
        content='Sounds great, see you at 10:00 AM tomorrow!',
        is_read=False,
    )

    # 7. Create Notifications
    Notification.objects.create(
        recipient=students['maria.santos'],
        sender=students['david.lee'],
        notification_type='NEW_MESSAGE',
        title='New Message from David Lee',
        message='Sounds great, see you at 10:00 AM tomorrow!',
        action_url='/messages?user=' + str(students['david.lee'].id),
        is_read=False,
    )
    Notification.objects.create(
        recipient=students['david.lee'],
        sender=students['maria.santos'],
        notification_type='REQUEST_ACCEPTED',
        title='Borrow Request Approved',
        message='Maria Santos accepted your request to borrow "Introduction to Algorithms (CLRS)". Return date: 10 days remaining.',
        action_url='/borrowing',
        is_read=True,
    )
    Notification.objects.create(
        recipient=students['ana.reyes'],
        sender=students['maria.santos'],
        notification_type='NEW_REVIEW',
        title='New 5-Star Rating Received!',
        message='Maria Santos rated you 5 stars: "The reviewer book was in pristine condition..."',
        action_url='/profile',
        is_read=False,
    )

    print("✓ Successfully populated initial transactions, borrowings, reviews, messages, and notifications!")


if __name__ == '__main__':
    seed()

