<!--

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

-->
# Development Guide

## Development Agreements

### Code Formatting

We utilize the [Spotless plugin](https://github.com/diffplug/spotless/tree/main/plugin-maven) and [google-java-format](https://github.com/google/google-java-format) to format Java code. You can configure the IDE to automatically apply formatting on save by following these steps (using IDEA as an example):

1. Download [google-java-format-plugin v1.7.0.5](https://plugins.jetbrains.com/plugin/8527-google-java-format/versions/stable/83169) and install it into the IDEA (Preferences -> Plugins -> search for google-java-format). For more details, please check the [manual](https://github.com/google/google-java-format#intellij-android-studio-and-other-jetbrains-ides).
2. Install from disk (Plugins -> gear icon -> "Install plugin from disk" -> Navigate to downloaded the zip file).
3. Enable the plugin and keep the default google format (2-space indents).
4. Avoid upgrading the google-java-format plugin until Spotless upgrades to version 18 or higher
5. Install the [Save Actions](https://plugins.jetbrains.com/plugin/7642-save-actions) plugin. Enable "Optimize imports" and "Reformat file" options.
6. Under "Save Actions" settings, set `File Path Inclusion` to ```.*.java``` to prevent accidental reformatting of non-Java files.

### Code Styles

We enforce code style consistency using the [maven-checkstyle-plugin](https://checkstyle.sourceforge.io/config_filefilters.html) guided by the rules defined in the [checkstyle.xml]( https://github.com/apache/iotdb/blob/master/checkstyle.xml) file in the project root directory. To validate your code style, execute `mvn validate`.

Ensure your IDE's default code style settings do not conflict with the project's rules.

In IDEA, you can align your style settings as follows.

- Disable wildcard imports:
  - Navigate to Java code style settings (Preferences -> Editor -> Code Style -> Java).
  - Go to the "Import" tab.
  - In the "General" section, enable "Use single class import".
  - Set "Class count to use import with '*'" to 999 or a larger value.
  - Set "Names count to use static import with '*' " to 999 or a larger value.

## Contribution Methods

### Participating in Votes

- Step 1: Vote for a release

  - Please read https://cwiki.apache.org/confluence/display/IOTDB/Validating+a+staged+Release

- Step 2: Download Artifacts

  - Access release candidates at https://dist.apache.org/repos/dist/dev/iotdb/

- Step 3: Import the Public Key of the Release Manager

  - Retrieve keys from https://dist.apache.org/repos/dist/dev/iotdb/KEYS and use `gpg2` for the import. Instructions and the start of public keys are listed on the page.

  - The first way:

    * The beginning of the public key is:

      ```
      pub   rsa4096 2019-10-15 [SC]
          10F3B3F8A1201B79AA43F2E00FC7F131CAA00430
      ```

      Or

      ```
      pub   rsa4096/28662AC6 2019-12-23 [SC]
      ```

    * Download the public key:

      ```
      gpg2 --receive-keys 10F3B3F8A1201B79AA43F2E00FC7F131CAA00430 (or 28662AC6)
      ```

      or (specify keyserver) 

      ```
      gpg2 --keyserver p80.pool.sks-keyservers.net --recv-keys 10F3B3F8A1201B79AA43F2E00FC7F131CAA00430 (or 28662AC6)
      ```

  - The second way:

    * Copy the content below into a text file named `key.asc`:

      ```
      -----BEGIN PGP PUBLIC KEY BLOCK-----
      Version: GnuPG v2
      ...
      -----END PGP PUBLIC KEY BLOCK-----
      ```

      Import RM's public key to your computer:

      ```
      gpg2 --import key.asc
      ```

- Step 4: Verification of Releases

  * Ensure LICENSE and NOTICE files are present and correct

  * Check README and RELEASE_NOTES files

  * Validate code headers:

    ```
    mvn -B apache-rat:check
    ```

  * Verify signatures and hashes

    ```
    gpg2 --verify apache-iotdb-0.12.0-source-release.zip.asc apache-iotdb-0.12.0-source-release.zip
    
    # Look for a message indicating a "Good Signature"
    
    shasum -a512 apache-iotdb-0.12.0-source-release.zip
    
    # Compare the output with the corresponding .sha512 file. If they match, the verification is successful.
    ```

  * Verify the compilation:

    ```
    mvnw install
    ```

    Ensure that the output ends with "SUCCESS" for all tasks.

- Step 5: Verify the Binary Release

  * Ensure LICENSE and NOTICE files are present and correct

  * Check README and RELEASE_NOTES files

  * Verify signatures and hashes

    ```
    gpg2 --verify apache-iotdb-0.12.0-bin.zip.asc apache-iotdb-0.12.0-bin.zip
    
    # Look for a message indicating a "Good Signature".
    
    shasum -a512 apache-iotdb-0.12.0-bin.zip
    
    # Compare the output with the corresponding .sha512 file. If they match, the verification is successful.
    ```

  * Verify that it starts and the sample statements execute correctly

    To ensure the server starts and executes sample statements correctly, run the following commands:

    ```
    nohup ./sbin/start-server.sh >/dev/null 2>&1 &
    
    ./sbin/start-cli.sh
    
    CREATE DATABASE root.turbine;
    CREATE TIMESERIES root.turbine.d1.s0 WITH DATATYPE=DOUBLE, ENCODING=GORILLA;
    insert into root.turbine.d1(timestamp,s0) values(1,1);
    insert into root.turbine.d1(timestamp,s0) values(2,2);
    insert into root.turbine.d1(timestamp,s0) values(3,3);
    select * from root.**;
    
    # Expect the following output:
    +-----------------------------------+------------------+
    |                               Time|root.turbine.d1.s0|
    +-----------------------------------+------------------+
    |      1970-01-01T08:00:00.001+08:00|               1.0|
    |      1970-01-01T08:00:00.002+08:00|               2.0|
    |      1970-01-01T08:00:00.003+08:00|               3.0|
    +-----------------------------------+------------------+
    
    ```

- Step 6: Send an Email After Verification

  Once verification is complete, you can send an email to confirm the successful validation:

  ```
  Hi,
  
  +1 (PMC could binding)
  
  The source release:
  LICENSE and NOTICE [ok]
  signatures and hashes [ok]
  All files have ASF header [ok]
  could compile from source: ./mvnw clean install [ok]
  
  The binary distribution:
  LICENSE and NOTICE [ok]
  signatures and hashes [ok]
  Could run with the following statements [ok]
  
  CREATE DATABASE root.turbine;
  CREATE TIMESERIES root.turbine.d1.s0 WITH DATATYPE=DOUBLE, ENCODING=GORILLA;
  insert into root.turbine.d1(timestamp,s0) values(1,1);
  insert into root.turbine.d1(timestamp,s0) values(2,2);
  insert into root.turbine.d1(timestamp,s0) values(3,3);
  select * from root.**;
  
  Thanks,
  xxx
  ```

### Code Contribution

#### Contribution process:

Tasks are managed as issues in JIRA in the Apache IoTDB community. 

The full lifecycle of an Issue: Create an issue -> assign an issue -> submit a PR(pull request) -> review the PR -> merge the pr -> close the issue. 

#### Create an Issue：

  - Clearly name and describe the issue in JIRA:
    * Naming: Try to make it clear and easy to understand. Examples include supporting a new aggregate query function (avg) and optimizing the performance of querying raw data. The issue will later be included in the release note.
    * Description: New features and improvements should be clear. Mention environment, affected versions, and steps to reproduce if reporting bugs.

#### Assign an Issue：

  - To prevent duplicate efforts, add a comment like "I'm working on this" when you take up an issue.

    Note: If you cannot assign an issue, it is because your account does not have the necessary permission.
    In this case, please send an email to the dev@iotdb.apache.org mailing list with the title of "[application] apply for permission to assign issues to XXX (your JIRA username)".

#### Submit a PR

  - How to submit code

    - Contribution path:

      The IoTDB community welcomes developers to participate in building the open source project. You can check [Issues](https://issues.apache.org/jira/projects/IOTDB/issues) and contribute to their resolution or make other improvements.

      Submit a PR that passes Travis-CI tests and Sonar code quality checks. If at least one committer approves and there are no code conflicts, the PR can be merged.

    - PR guidelines:

      Submitting a [Pull Request](https://help.github.com/articles/about-pull-requests/) on GitHub is straightforward. The following steps use the [apache/iotdb](https://github.com/apache/iotdb) project as an example (replace "iotdb" with the relevant project name if different).

      - Fork the repository:

        Navigate to the [github page](https://github.com/apache/iotdb) and click "Fork" in the upper right corner

      - Configure git and submit changes

        - Step 1: Clone the code locally:

        ```
        git clone https://github.com/<your_github_name>/iotdb.git
        ```

           **Note: Please replace `<your_github_name>` with your GitHub username.** The origin will default to your fork on GitHub after cloning.

        - Step 2: Add apache/iotdb as an upstream remote branch:

        ```
        cd  iotdb
        git remote add upstream https://github.com/apache/iotdb.git
        ```

        - Step 3: Check the remote repository settings:

        ```
        git remote -v
        origin https://github.com/<your_github_name>/iotdb.git (fetch)
        origin    https://github.com/<your_github_name>/iotdb.git(push)
        upstream  https://github.com/apache/iotdb.git (fetch)
        upstream  https://github.com/apache/iotdb.git (push)
        ```

        - Step 4: Create a new branch to make changes (assume the new branch name is `fix`):

        ```
        git checkout -b fix
        ```

        Once created, you can make changes to the code.

        - Step 5: Commit your changes to the remote branch(here's an example of a `fix` branch): 

        ```
        git commit -a -m "<you_commit_message>"
        git push origin fix
        ```

        For more on git usage, visit: [Git Usage Tutorial](https://www.atlassian.com/git/tutorials/setting-up-a-repository)

      - Important Notes for Git Commit

        - Keep your repository clean:

          - Do not upload binary files. Ensure the repository size only increases due to code changes.

          - Do not upload generated code.

        - Make meaningful commit messages:

          - Title with JIRA number: [IOTDB-JIRA number].

          - Title with GitHub ISSUE number: [ISSUE-issue number].

          - Include #XXXX in the content for linking purposes.

      - Create a PR

        Navigate to your GitHub repository page in the browser, switch to your committed branch `<your_branch_name>`, and click "New pull request" and "Create pull request" buttons in turn to create a PR. If you are addressing [Issues](https://issues.apache.org/jira/projects/IOTDB/issues), include [IOTDB-xxx] at the beginning.

        At this point, your PR is created. For more information on PRs, please read [Collaborating-with-issues-and-pull-requests](https://help.github.com/categories/collaborating-with-issues-and-pull-requests/)

      - Conflict resolution

        Code conflicts during PR submission are typically caused by multiple people editing the same file. They can be resolved by following these steps:

        Step 1: Switch to the master branch

        ```
        git checkout master
        ```

        Step 2: Synchronize the remote master branch to your local branch

        ```
        git pull upstream master
        ```

        Step 3: Switch back to the branch you were on (assuming it's named `fix`)

        ```
        git checkout fix
        ```

        Step 4: Perform a rebase

        ```
        git rebase -i master
        ```

        Save the file that pops up (usually no changes needed). You will then be prompted to resolve conflicts in the specified files. Execute the following code after all the conflicts are resolved.

        ```
        git add .
        git rebase --continue
        ```

        Repeat until you see a message like *rebase successful*, then you can update the branch you submitted the PR from:

        ```
        git push -f origin fix
        ```

  - Content to be submitted:

    - Issue Type: New Feature

      - Submit user manuals and code modification PRs in both English and Chinese.

        The user manual mainly describes the function definition and usage. It should include scenario descriptions, configuration methods, interface function descriptions, and usage examples. Place content in the `src/UserGuide` directory for English and `src/zh/UserGuide` for Chinese on the main branch of the apache/iotdb-docs repository.

        Update the user guide by making corresponding changes in `src/.vuepress/sidebar` on the main branch.

      - Commit Unit Test UT or Integration Test IT

        Submit Unit Tests (UT) or Integration Tests (IT) covering as many cases as possible, referencing existing tests as models. You can refer to `xxTest` (Path: `iotdb/server/src/test/java/org/apache/iotdb/db/query/aggregation/`) or `xxIT` (Path: `iotdb/integration/src/test/java/org/apache/iotdb/db/integration/`). 

    - Issue Type: Improvement

      Submit code and UT. Generally, there is no need to modify the user manual. It is advisable to submit experimental results showing quantified improvements and side effects.

    - Issue type: Bug

      Write UT or IT that can reproduce the bug.

  - Code management

    - Branch management:

      - The naming scheme of the IoTDB version is: `0.Major_version.Minor_version`. For example, in version 0.12.4, 12 represents the major version and 4 refers to the minor version.

      - The master branch corresponds to the next unreleased major version. Each major version release is archived in a separate branch, e.g., the code for the 0.12.x series is under the `rel/0.12` branch.

      - Bug fixes found in a released version should be submitted to all branches that are equal to or newer than that version. For example, a PR about a bug fix in version 0.11.x should be submitted to `rel/0.11` branch, `rel/0.12` branch and master branch.

     - Code formatting:

       Before submitting a PR, use `mvn spotless:apply` to format the code, otherwise the CI code format check will fail.

     - Notes:

       - The default values between `iotdb-datanode.properties` and `IoTDBConfig` must be consistent 

       - If configuration parameters are changed, modify the following files simultaneously:

         - Configuration file: `iotdb-core/datanode/src/assembly/resources/conf/iotdb-datanode.properties`

         - Code: `IoTDBDescriptor`, `IoTDBConfig`

         - Documentation: `apache/iotdb-docs/src/UserGuide/{version}/Reference/DataNode-Config-Manual.md`, `apache/iotdb-docs/src/zh/UserGuide/{version}/Reference/DataNode-Config-Manual.md`

           To modify configuration parameters in IT and UT files, you should make these modifications within methods annotated with `@Before` and reset them in methods annotated with `@After` to avoid affecting other tests. Parameters for the compaction module should be consolidated in the `CompactionConfigRestorer` file.

  - PR Naming

    - Naming Convention: Branch tag - JIRA tag - PR name

      Example: [To rel/0.12] [IoTDB-1907] implement customized sync process: sender

    - Branch tag

      If you are submitting a PR to a non-master branch, such as the `rel/0.13` branch, include the branch tag in the PR name, like [To rel/0.13]. If the PR is targeted at the master branch, no branch tag is needed.

    - Jira tag

      Start with the JIRA number, such as [IoTDB-1907] implement customized sync process: sender. This way, once the PR is created, bots will automatically link the PR to the corresponding issue.

      Note: This auto-linking won't happen if the PR is created without any JIRA number or with one that is improper, in which case you need to correct the PR name and manually paste the PR link to the issue page by adding a comment or attaching a link.

  * PR Description

    Typically, the PR name cannot cover all changes, so it's necessary to add a detailed description of what has been altered. Provide explanations for any aspects that may be difficult to understand.

    For PRs fixing bugs, describe the cause of the bug and the solution. Additionally, detail the addition of UT/IT test cases and any potential negative effects.

  * After Submitting a PR

    Send an email to the mailing list at dev@iotdb.apache.org, outlining the work done in the PR. ake each reviewer's feedback seriously, respond to each comment, and make adjustments after reaching a consensus.

#### Review a PR

- Key Considerations:
  - PR Naming: Ensure PRs are properly named with the JIRA number for new features and bug fixes.
  - PR Description: Check if the description is clear.
  - Test Cases: Attach functional or performance test reports.
  - User Manuals: Ensure that new features include a user manual.
  - Code Isolation: Avoid mixing unrelated code changes in the same PR. Split unrelated modifications into separate PRs.

- Review Process：

  - First step: Click "Files changed" in the PR
    <img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/zh/development/howtocontributecode/01.png">

  - Second step: For lines with issues, move to the left side where a plus sign appears. Click the plus, leave a comment, and then click "Start a review". At this point, all review comments are saved temporarily and are not visible to others.
    <img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/zh/development/howtocontributecode/02.png">

  - Third step: After all the comments are added, click "Review changes", choose your feedback — "Approve" if it’s ready to merge, "Request changes" if there are bugs that need correction, or "Comment" if you're unsure. Finally, submit your review comments which will then be visible to the person who submitted the PR.
    <img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/zh/development/howtocontributecode/03.png">

#### Merge a PR

- Confirm that all review comments have been addressed and you have approval from at least one committer.

- Choose `squash` merge. Opt for `rebase` only if the author has a single, clear commit log.

- Close the corresponding issue on JIRA, and tag the fixed or completed version. [Note that solving or closing an issue should always include adding a PR or description on JIRA to allow tracking of task changes.]

### Contribute to Documentation

The process for contributing to the user manual is the same as for code, but involves different files:

- The English user manual is located in `src/UserGuide`.
- The Chinese version is located in `src/zh/UserGuide`.
- To update the user manual directory, including adding or deleting markdown documents or changing document names, appropriate modifications should be made in `src/.vuepress/sidebar` on the main branch.


### New Features, Bug Feedback, Improvements, etc.

Any new features or bugs to be fixed can be submitted as an issue on JIRA.

You can select the type of issue: bug, improvement, new feature, etc. New issues are automatically synchronized to the mailing list, and subsequent discussions can take place on JIRA or via the mailing list. Please close the issue once it is resolved.

### Email discussion Content

Please conduct discussions in English:

  - When joining the mailing list for the first time, you might introduce yourself (e.g., "Hi, I'm xxx...").

  - Before starting work on a feature, you may announce your intent via email (e.g., "Hi, I'm working on issue IOTDB-XXX, My plan is...").

### Frequently Asked Questions

- Unable to download files such as `thrift-*`:
  For example `Could not get content org.apache.maven.wagon.TransferFailedException: Transfer failed for https://github.com/apache/iotdb-bin-resources/blob/main/compile-tools/thrift-0.14-ubuntu`.
  This is usually a network issue, requiring manual download of the specified files:

  - Download manually from:
    * [thrift-0.14-MacOS](https://github.com/apache/iotdb-bin-resources/blob/main/compile-tools/thrift-0.14-MacOS)
    * [thrift-0.14-ubuntu](https://github.com/apache/iotdb-bin-resources/blob/main/compile-tools/thrift-0.14-ubuntu)

  - Copy the file to the `thrift/target/tools/` directory.
  - Re-execute the Maven compile command.

- Unable to download `errorprone`:

  ```
  Failed to read artifact descriptor for com.google.errorprone:javac
  -shaded:jar:9+181-r4173-1: Could not transfer artifact com.google.errorprone:javac-shaded:pom:9+181-r4173-1
  ```

  Solution:

      1. Manually download the jar package [javac-shaded-9+181-r4173-1.jar](https://repo1.maven.org/maven2/com/google/errorprone/javac-shaded/9+181-r4173-1/javac-shaded-9+181-r4173-1.jar)

      2. Install the jar package to the local private repository: 

    ```
  mvn install:install-file -DgroupId=com.google.errorprone -DartifactId=javac-shaded -Dversion=9+181-r4173-1 -Dpackaging=jar -Dfile=D:\workspace\iotdb-master\docs\javac-shaded-9+181-r4173-1.jar
    ```

## References

- Apache IoTDB Official Website：https://iotdb.apache.org/

- Code Repository：https://github.com/apache/iotdb

- Go Language Repository: https://github.com/apache/iotdb-client-go

- Documentation Repository：https://github.com/apache/iotdb-docs

- Resource Repository (project's documents, compiler, etc): https://github.com/apache/iotdb-bin-resources

- Quick Start Guide：http://iotdb.apache.org/UserGuide/Master/QuickStart/QuickStart_apache.html

- JIRA Task Management：https://issues.apache.org/jira/projects/IOTDB/issues

- WiKi Documentation：https://cwiki.apache.org/confluence/display/IOTDB/Home

- Mailing list: https://lists.apache.org/list.html?dev@iotdb.apache.org

- Daily Builds: https://ci-builds.apache.org/job/IoTDB/job/IoTDB-Pipe/job/master/

- Slack: https://apacheiotdb.slack.com/join/shared_invite/zt-qvso1nj8-7715TpySZtZqmyG5qXQwpg#/shared-invite/email