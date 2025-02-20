export const generateLaTeX = (resumeData) => {
    const escapeLaTeX = (str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/~/g, '\\textasciitilde')
        .replace(/\^/g, '\\textasciicircum');
    };
  
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
  
    // Process social media links
    const socialMedia = resumeData.socialMedia || [];
    const socialLinks = {
      linkedin: socialMedia.find(s => s.socialMedia === 'LinkedIn')?.link,
      github: socialMedia.find(s => s.socialMedia === 'Github')?.link,
      website: socialMedia.find(s => s.socialMedia === 'Website')?.link
    };
  
    // Process education entries
    const education = (resumeData.education || []).map(edu => ({
      school: edu.school,
      degree: edu.degree,
      startDate: edu.startYear,
      endDate: edu.endYear,
      description: edu.description
    }));
  
    // Process work experience (combining description and keyAchievements)
    const workExperience = (resumeData.workExperience || []).map(exp => ({
      ...exp,
      descriptions: [
        exp.description,
        ...(exp.keyAchievements ? exp.keyAchievements.split('\n') : [])
      ].filter(d => d)
    }));
  
    // Process certifications
    const certifications = (resumeData.certifications || []).map(cert =>
      typeof cert === 'string' ? { name: cert } : cert
    );
  
    // Process languages (allow string entries)
    const languages = (resumeData.languages || []).map(lang =>
      typeof lang === 'string' ? { language: lang } : lang
    );
  
    // Optional sections: projects, qualities, interests
    const projects = resumeData.projects || [];
    const qualities = resumeData.qualities || [];
    const interests = resumeData.interests || [];
  
    return `\\documentclass[9pt]{extarticle}
  
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  % Developer CV
  % LaTeX Class (Standalone Version)
  % Based on the Developer CV template from LaTeXTemplates.com
  % Modified for a self-contained file
  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  
  %----------------------------------------------------------------------------------------
  %   PACKAGES AND DOCUMENT CONFIGURATIONS
  %----------------------------------------------------------------------------------------
  
  \\usepackage[hidelinks]{hyperref} % For clickable links without boxes
  \\pagestyle{empty} % No headers or footers
  
  \\usepackage{moresize} % More font size commands
  \\usepackage{enumitem}
  \\usepackage{geometry} % Adjust page margins
  \\geometry{
      paper=a4paper,
      top=1.6cm,
      bottom=1.6cm,
      left=1.4cm,
      right=1.6cm,
      headheight=0.75cm,
      footskip=1cm,
      headsep=0.5cm
  }
  
  \\usepackage[utf8]{inputenc} % For international characters
  \\usepackage[T1]{fontenc}
  \\usepackage[default]{raleway}
  \\renewcommand*\\familydefault{\\sfdefault} % Use sans-serif fonts
  
  \\usepackage{fontawesome} % For icons
  
  % Command to output an icon with a black square and text
  \\newcommand{\\icon}[3]{%
      \\vcenteredhbox{\\colorbox{white}{\\makebox(#2, #2){\\textcolor{black}{\\Large\\csname fa#1\\endcsname}}}}%
      \\hspace{0.1cm}%
      \\vcenteredhbox{\\textcolor{black}{#3}}%
  }
  
  \\usepackage{tikz} % For graphics
  \\usetikzlibrary{shapes, backgrounds}
  \\tikzset{x=1cm, y=1cm}
  
  % Command to vertically centre content
  \\newcommand{\\vcenteredhbox}[1]{%
      \\begingroup%
          \\setbox0=\\hbox{#1}\\parbox{\\wd0}{\\box0}%
      \\endgroup%
  }
  
  %----------------------------------------------------------------------------------------
  %   CUSTOM SECTION COMMANDS
  %----------------------------------------------------------------------------------------
  \\def\\Vhrulefill{\\leavevmode\\leaders\\hrule height 0.7ex depth \\dimexpr0.4pt-0.7ex\\hfill\\kern0pt}
  
  % Section title command
  \\newcommand{\\cvsect}[1]{%
      \\vspace{\\baselineskip}%
      \\textcolor{black}{\\MakeUppercase{\\textbf{#1}}} \\hspace{4pt} \\Vhrulefill \\\\
  }
  
  %----------------------------------------------------------------------------------------
  %   ENTRY LIST ENVIRONMENT
  %----------------------------------------------------------------------------------------
  \\usepackage{longtable}
  \\setlength{\\LTpre}{0pt}
  \\setlength{\\LTpost}{0pt}
  \\setlength{\\tabcolsep}{0pt}
  
  \newenvironment{entrylist}{
    \begin{longtable}{@{}p{0.15\textwidth} p{0.85\textwidth}@{}}
    }{
        \end{longtable}
    }

  
  \\newcommand{\\entry}[4]{%
      \\parbox[t]{0.15\\textwidth}{\\small #1}%
      &\\parbox[t]{0.85\\textwidth}{\\textbf{#2}\\hfill{\\footnotesize \\textbf{\\textcolor{black}{#3}}}\\\\ #4}\\\\%
  }
  
  \\newcommand{\\slashsep}{\\hspace{3mm}/\\hspace{3mm}}
  
  %----------------------------------------------------------------------------------------
  %   BEGIN DOCUMENT
  %----------------------------------------------------------------------------------------
  
  \\begin{document}
  
  %----------------------------------------------------------------------------------------
  %   TITLE AND CONTACT INFORMATION
  %----------------------------------------------------------------------------------------
  \\makebox[\\textwidth]{
  \\begin{minipage}[t]{0.25\\textwidth}
    \\vspace{-\\baselineskip}
    \\vspace{20pt}
    \\fontsize{15}{20}
    \\textcolor{black}{\\textbf{\\parbox[t]{\\linewidth}{\\MakeUppercase{${escapeLaTeX(resumeData.position || '').replace(' ', '\\\\ \\vspace{0pt}')}}}}}
    
    \\vspace{6pt}
    
    {\\MakeUppercase{${escapeLaTeX(resumeData.name)}}}
  \\end{minipage}
  \\hfill
  \\begin{minipage}[t]{0.2\\textwidth}
    \\vspace{-\\baselineskip}
    \\vspace{20pt}
    ${resumeData.contactInformation ? `\\icon{Phone}{11}{${escapeLaTeX(resumeData.contactInformation)}}\\` : ''}
    ${resumeData.address ? `\\icon{MapMarker}{11}{${escapeLaTeX(resumeData.address)}}\\` : ''}
  \\end{minipage}
  \\begin{minipage}[t]{0.27\\textwidth}
    \\vspace{-\\baselineskip}
    \\vspace{20pt}
    ${resumeData.email ? `\\icon{Envelope}{11}{\\href{mailto:${escapeLaTeX(resumeData.email)}}{${escapeLaTeX(resumeData.email)}}}\\` : ''}
    ${socialLinks.linkedin ? `\\icon{LinkedinSquare}{11}{\\href{${escapeLaTeX(socialLinks.linkedin)}}{${escapeLaTeX(socialLinks.linkedin)}}}\\` : ''}
    ${socialLinks.github ? `\\icon{Github}{11}{\\href{${escapeLaTeX(socialLinks.github)}}{${escapeLaTeX(socialLinks.github)}}}` : ''}
  \\end{minipage}
}

  
  %----------------------------------------------------------------------------------------
  %   INTRODUCTION & SKILLS
  %----------------------------------------------------------------------------------------
  
  \\begin{minipage}[t]{0.46\\textwidth}
      \\cvsect{Résumé}
      \\vspace{1pt}
      ${escapeLaTeX(resumeData.summary)}
  \\end{minipage}
  \\hfill
  \\begin{minipage}[t]{0.465\\textwidth}
      \\cvsect{Compétences}
      \\vspace{1pt}
      ${(resumeData.skills || []).map(skill => `
      \\begin{minipage}[t]{0.2\\textwidth}
          \\textbf{${escapeLaTeX(skill.title)}}:\\vspace{-5pt}
      \\end{minipage}
      \\hfill
      \\begin{minipage}[t]{0.73\\textwidth}
          ${(skill.skills || []).map(k => escapeLaTeX(k)).join(', ')}\\vspace{3pt}
      \\end{minipage}`).join('\n')}
  \\end{minipage}
  
  %----------------------------------------------------------------------------------------
  %   EDUCATION
  %----------------------------------------------------------------------------------------
  
  \\vspace{0pt}
  \\cvsect{Éducation}
  \\begin{entrylist}
  ${education.map(edu => `
    \\entry
        {${new Date(edu.startDate).getFullYear()}${edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ''}}
        {${escapeLaTeX(edu.degree)}}
        {${escapeLaTeX(edu.school)}}
        {${escapeLaTeX(edu.description || '')}}`).join('\n')}
  \\end{entrylist}
  
  %----------------------------------------------------------------------------------------
  %   EXPERIENCE
  %----------------------------------------------------------------------------------------
  
  \\vspace{-10pt}
  \\cvsect{Expérience}
  \\begin{entrylist}
  ${workExperience.map(exp => `
    \\entry
        {${new Date(exp.startYear).getFullYear()}${exp.endYear ? ` - ${new Date(exp.endYear).getFullYear()}` : ''}}
        {${escapeLaTeX(exp.position)}}
        {${escapeLaTeX(exp.company)}}
        {${exp.descriptions && exp.descriptions.length > 0 ? `
            \\begin{itemize}
            ${exp.descriptions.map(item => `\\item ${escapeLaTeX(item)}`).join('\n')}
            \\end{itemize}` : ''}
            ${exp.environment ? `\\\\ \\texttt{${escapeLaTeX(exp.environment)}}` : ''}}
`).join('\n')}
\\end{entrylist}

  
  ${projects.length > 0 ? `
  %----------------------------------------------------------------------------------------
  %   PROJECTS
  %----------------------------------------------------------------------------------------
  
  \\vspace{-20pt}
  \\cvsect{Projets}
  \\begin{entrylist}
  ${projects.map(proj => `
      \\entry
          {${formatDate(proj.startDate)}${proj.endDate ? ` - ${formatDate(proj.endDate)}` : ''}}
          {${escapeLaTeX(proj.name)}}
          {${escapeLaTeX(proj.technologies || '')}}
          {${escapeLaTeX(proj.description || '')}}`).join('\n')}
  \\end{entrylist}
  ` : ''}
  
  %----------------------------------------------------------------------------------------
  %   CERTIFICATIONS
  %----------------------------------------------------------------------------------------
  
  \\vspace{-20pt}
  \\cvsect{Certificat}
  \\begin{entrylist}
  ${certifications.map(cert => `
      \\entry
          {}
          {\\textbf{${escapeLaTeX(cert.name)}}}
          {}
          {${escapeLaTeX(cert.issuer || '')}${cert.score ? ` - ${escapeLaTeX(cert.score)}` : ''}}`).join('\n')}
  \\end{entrylist}
  
  ${interests.length > 0 ? `
  %----------------------------------------------------------------------------------------
  %   INTERESTS
  %----------------------------------------------------------------------------------------
  
  \\vspace{-10pt}
  \\cvsect{Intérêts}
  \\vspace{0pt}
  \\hspace{26mm} \\textbf{${interests.map(i => escapeLaTeX(i)).join(', ')}}` : ''}
  
  ${qualities.length > 0 ? `
  %----------------------------------------------------------------------------------------
  %   QUALITÉS
  %----------------------------------------------------------------------------------------
  
  \\vspace{-10pt}
  \\cvsect{Qualités}
  \\vspace{0pt}
  \\hspace{25mm} \\textbf{${qualities.map(q => escapeLaTeX(q)).join(' - ')}} \\\\` : ''}
  
  %----------------------------------------------------------------------------------------
  %   LANGUAGES
  %----------------------------------------------------------------------------------------
  
  \\vspace{-10pt}
  \\cvsect{Langues}
  \\vspace{-0pt}
  \\hspace{26mm} \\textbf{${languages.map(lang => escapeLaTeX(lang.language)).join(', ')}} 
  
  \\end{document}
  `;
  };
  