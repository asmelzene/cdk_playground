from setuptools import setup, find_packages

setup(
    name='my_glue_package',
    version='0.1',
    packages=find_packages(),
    description='A sample package for AWS Glue',
    author='Your Name',
    author_email='your.email@example.com',
    url='https://github.com/yourusername/my_glue_package',  # Update as appropriate
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)
